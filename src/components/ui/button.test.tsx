import { render, screen } from "@testing-library/react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

describe("Button - Brutalist Style", () => {
  it("renders with default variant", () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole("button", { name: /click me/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass("bg-[var(--text-primary)]")
    expect(button).toHaveClass("rounded-none")
    expect(button).toHaveClass("border-2")
    expect(button).toHaveClass("font-mono")
  })

  it("renders with destructive variant", () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole("button", { name: /delete/i })
    expect(button).toHaveClass("bg-[var(--danger)]")
  })

  it("renders with outline variant", () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole("button", { name: /outline/i })
    expect(button).toHaveClass("border-[var(--border)]")
    expect(button).toHaveClass("bg-transparent")
  })

  it("applies size classes correctly", () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole("button", { name: /large/i })
    expect(button).toHaveClass("h-11")
    expect(button).toHaveClass("px-8")
  })

  it("has no rounded corners", () => {
    render(<Button>Rounded None</Button>)
    const button = screen.getByRole("button", { name: /rounded none/i })
    expect(button.className).toContain("rounded-none")
    expect(button.className).not.toContain("rounded-md")
  })

  it("uses monospace font", () => {
    render(<Button>Mono</Button>)
    const button = screen.getByRole("button", { name: /mono/i })
    expect(button).toHaveClass("font-mono")
  })
})
