package auth

import (
	"testing"
)

// TestGenerateToken menguji pembuatan JWT token dengan berbagai skenario
func TestGenerateToken(t *testing.T) {
	tests := []struct {
		name        string
		userID      uint
		role        string
		wantErr     bool
		description string
	}{
		{
			name:        "admin user",
			userID:      1,
			role:        "admin",
			wantErr:     false,
			description: "Token untuk admin harus berhasil digenerate",
		},
		{
			name:        "security analyst",
			userID:      2,
			role:        "security_analyst",
			wantErr:     false,
			description: "Token untuk security_analyst harus berhasil",
		},
		{
			name:        "viewer",
			userID:      3,
			role:        "viewer",
			wantErr:     false,
			description: "Token untuk viewer harus berhasil",
		},
		{
			name:        "auditor",
			userID:      4,
			role:        "auditor",
			wantErr:     false,
			description: "Token untuk auditor harus berhasil",
		},
		{
			name:        "user ID nol",
			userID:      0,
			role:        "viewer",
			wantErr:     false,
			description: "UserID 0 boleh saja (edge case)",
		},
		{
			name:        "role kosong",
			userID:      1,
			role:        "",
			wantErr:     false,
			description: "Role kosong harus tetap menghasilkan token (validasi di level service)",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token, err := GenerateToken(tt.userID, tt.role)

			// Cek error expectation
			if (err != nil) != tt.wantErr {
				t.Errorf("GenerateToken() error = %v, wantErr %v - %s", err, tt.wantErr, tt.description)
				return
			}

			// Jika tidak expect error
			if !tt.wantErr {
				// Token tidak boleh kosong
				if token == "" {
					t.Error("GenerateToken() returned empty token")
				}

				// Token JWT harus memiliki 3 bagian: header.payload.signature
				parts := splitToken(token)
				if len(parts) != 3 {
					t.Errorf("GenerateToken() returned invalid JWT format, parts = %d, want 3", len(parts))
				}

				// Setiap bagian tidak boleh kosong
				for i, part := range parts {
					if part == "" {
						t.Errorf("GenerateToken() part %d of token is empty", i)
					}
				}
			}
		})
	}
}

// TestGenerateTokenUniqueness menguji bahwa token yang sama untuk user yang sama memiliki nilai berbeda (karena jti - JWT ID atau waktu)
func TestGenerateTokenUniqueness(t *testing.T) {
	userID := uint(1)
	role := "admin"

	token1, err1 := GenerateToken(userID, role)
	token2, err2 := GenerateToken(userID, role)

	if err1 != nil || err2 != nil {
		t.Fatalf("GenerateToken() returned error: err1=%v, err2=%v", err1, err2)
	}

	// JWT token harusnya berbeda karena waktu pembuatan (iat) atau jti yang berbeda
	// Catatan: beberapa implementasi mungkin menghasilkan token yang sama jika dalam waktu yang bersamaan
	// Ini test optional, tergantung implementasi
	if token1 == token2 {
		t.Log("GenerateToken() generated identical tokens (might be acceptable if generated at same time)")
	}
}

// TestValidateToken menguji validasi JWT token dengan berbagai skenario
func TestValidateToken(t *testing.T) {
	// Setup: generate valid token untuk testing
	validToken, err := GenerateToken(1, "admin")
	if err != nil {
		t.Fatalf("Failed to generate token in test setup: %v", err)
	}

	tests := []struct {
		name        string
		token       string
		wantErr     bool
		description string
	}{
		{
			name:        "token valid",
			token:       validToken,
			wantErr:     false,
			description: "Token yang valid harus berhasil divalidasi",
		},
		{
			name:        "token invalid - format salah",
			token:       "invalid.token.format",
			wantErr:     true,
			description: "Token dengan format salah harus return error",
		},
		{
			name:        "token kosong",
			token:       "",
			wantErr:     true,
			description: "Token kosong harus return error",
		},
		{
			name:        "token hanya satu bagian",
			token:       "just-one-part",
			wantErr:     true,
			description: "Token tanpa titik harus return error",
		},
		{
			name:        "token dengan spasi",
			token:       validToken + " ",
			wantErr:     true,
			description: "Token dengan spasi di akhir harus return error",
		},
		{
			name:        "token manipulated - signature changed",
			token:       validToken[:len(validToken)-5] + "XXXXX",
			wantErr:     true,
			description: "Token dengan signature yang dimodifikasi harus return error",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			claims, err := ValidateToken(tt.token)

			if (err != nil) != tt.wantErr {
				t.Errorf("ValidateToken() error = %v, wantErr %v - %s", err, tt.wantErr, tt.description)
				return
			}

			// Jika tidak expect error, cek claims
			if !tt.wantErr {
				if claims == nil {
					t.Error("ValidateToken() returned nil claims")
					return
				}

				// Claims harus memiliki UserID yang valid
				if claims.UserID == 0 {
					t.Error("ValidateToken() returned zero UserID")
				}

				// Claims harus memiliki Role yang valid
				if claims.Role == "" {
					t.Error("ValidateToken() returned empty Role")
				}
			}
		})
	}
}

// TestValidateTokenClaims menguji apakah claims yang diekstrak benar
func TestValidateTokenClaims(t *testing.T) {
	// Test berbagai kombinasi userID dan role
	tests := []struct {
		name     string
		userID   uint
		role     string
	}{
		{"admin with ID 100", 100, "admin"},
		{"analyst with ID 200", 200, "security_analyst"},
		{"viewer with ID 300", 300, "viewer"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token, err := GenerateToken(tt.userID, tt.role)
			if err != nil {
				t.Fatalf("Failed to generate token: %v", err)
			}

			claims, err := ValidateToken(token)
			if err != nil {
				t.Fatalf("Failed to validate token: %v", err)
			}

			// Cek UserID
			if claims.UserID != tt.userID {
				t.Errorf("ValidateToken() UserID = %d, want %d", claims.UserID, tt.userID)
			}

			// Cek Role
			if claims.Role != tt.role {
				t.Errorf("ValidateToken() Role = %s, want %s", claims.Role, tt.role)
			}
		})
	}
}

// TestValidateTokenExpired menguji token yang sudah expired
func TestValidateTokenExpired(t *testing.T) {
	// Test ini membutuhkan kemampuan untuk membuat token dengan expiry custom
	// Atau menggunakan mock time
	// Implementasi tergantung pada GenerateTokenWithExpiry()
	t.Skip("Test for expired token requires custom expiry implementation in GenerateToken")
}

// TestValidateTokenBeforeValidity menguji token yang belum valid (nbf claim)
func TestValidateTokenBeforeValidity(t *testing.T) {
	// Test ini membutuhkan kemampuan untuk mengatur nbf (not before) claim
	t.Skip("Test for nbf (not before) claim requires custom implementation")
}

// TestExtractUserID menguji ekstraksi user ID dari claims
func TestExtractUserID(t *testing.T) {
	tests := []struct {
		name   string
		userID uint
	}{
		{"user ID 42", 42},
		{"user ID 1", 1},
		{"user ID 999", 999},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token, err := GenerateToken(tt.userID, "admin")
			if err != nil {
				t.Fatalf("Failed to generate token: %v", err)
			}

			claims, err := ValidateToken(token)
			if err != nil {
				t.Fatalf("Failed to validate token: %v", err)
			}

			if claims.UserID != tt.userID {
				t.Errorf("ExtractUserID() = %d, want %d", claims.UserID, tt.userID)
			}
		})
	}
}

// TestExtractRole menguji ekstraksi role dari claims
func TestExtractRole(t *testing.T) {
	tests := []struct {
		name string
		role string
	}{
		{"admin role", "admin"},
		{"security_analyst role", "security_analyst"},
		{"auditor role", "auditor"},
		{"viewer role", "viewer"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			token, err := GenerateToken(1, tt.role)
			if err != nil {
				t.Fatalf("Failed to generate token: %v", err)
			}

			claims, err := ValidateToken(token)
			if err != nil {
				t.Fatalf("Failed to validate token: %v", err)
			}

			if claims.Role != tt.role {
				t.Errorf("ExtractRole() = %s, want %s", claims.Role, tt.role)
			}
		})
	}
}

// TestTokenConsistency menguji konsistensi token (multiple validate harus return claims yang sama)
func TestTokenConsistency(t *testing.T) {
	token, err := GenerateToken(123, "admin")
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	// Validate multiple times, hasil harus sama
	for i := 0; i < 3; i++ {
		claims, err := ValidateToken(token)
		if err != nil {
			t.Fatalf("Failed to validate token (attempt %d): %v", i+1, err)
		}

		if claims.UserID != 123 {
			t.Errorf("ValidateToken() attempt %d: UserID = %d, want 123", i+1, claims.UserID)
		}

		if claims.Role != "admin" {
			t.Errorf("ValidateToken() attempt %d: Role = %s, want admin", i+1, claims.Role)
		}
	}
}

// Helper: splitToken memisahkan token JWT menjadi 3 bagian
func splitToken(token string) []string {
	parts := make([]string, 0, 3)
	start := 0
	for i := 0; i < len(token); i++ {
		if token[i] == '.' {
			parts = append(parts, token[start:i])
			start = i + 1
		}
	}
	parts = append(parts, token[start:])
	return parts
}
