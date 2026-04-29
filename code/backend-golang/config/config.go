package config

import (
	"fmt"
	"log"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Worker   WorkerPoolConfig
	Template TemplateConfig
}

type ServerConfig struct {
	Port int
	Host string
}

type DatabaseConfig struct {
	Host     string
	Port     int
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type WorkerPoolConfig struct {
	Size        int
	MaxRetries  int
	TaskTimeout int // seconds
}

type TemplateConfig struct {
	Dir string
}

func Load() (*Config, error) {
	v := viper.New()

	// Default values
	v.SetDefault("server.host", "localhost")
	v.SetDefault("server.port", 8080)
	v.SetDefault("database.host", "localhost")
	v.SetDefault("database.port", 5432)
	v.SetDefault("database.user", "postgres")
	v.SetDefault("database.password", "postgres")
	v.SetDefault("database.dbname", "vulnscanner")
	v.SetDefault("database.sslmode", "disable")
	v.SetDefault("worker.size", 50)
	v.SetDefault("worker.maxretries", 3)
	v.SetDefault("worker.tasktimeout", 30)
	v.SetDefault("template.dir", "./templates")

	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(".")
	v.AddConfigPath("./config")
	
	// Configure environment variable handling
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.SetEnvPrefix("") // No prefix, so SERVER_PORT maps to server.port
	v.AutomaticEnv()
	
	// Explicitly bind environment variables to ensure they're picked up
	v.BindEnv("server.host", "SERVER_HOST")
	v.BindEnv("server.port", "SERVER_PORT")
	v.BindEnv("database.host", "DATABASE_HOST")
	v.BindEnv("database.port", "DATABASE_PORT")
	v.BindEnv("database.user", "DATABASE_USER")
	v.BindEnv("database.password", "DATABASE_PASSWORD")
	v.BindEnv("database.dbname", "DATABASE_DBNAME")
	v.BindEnv("database.sslmode", "DATABASE_SSLMODE")
	v.BindEnv("worker.size", "WORKER_SIZE")
	v.BindEnv("worker.maxretries", "WORKER_MAXRETRIES")
	v.BindEnv("worker.tasktimeout", "WORKER_TASKTIMEOUT")
	v.BindEnv("template.dir", "TEMPLATE_DIR")

	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok {
			return nil, fmt.Errorf("failed to read config: %w", err)
		}
		log.Println("No config file found, using defaults and environment variables")
	}

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return &cfg, nil
}
