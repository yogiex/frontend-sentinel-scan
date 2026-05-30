import { render, screen } from "@testing-library/react"
import { Badge } from "./badge"

describe("Badge - Brutalist Style", () => {
  it("renders with rounded-none and border-2", () => {
    render(<Badge>Badge text</Badge>)
    const badge = screen.getByText("Badge text")
    expect(badge).toHaveClass("rounded-none")
    expect(badge).toHaveClass("border-2")
    expect(badge).toHaveClass("font-mono")
  })

  it("uses text-primary for default variant", () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText("Default")
    expect(badge).toHaveClass("bg-[var(--text-primary)]")
  })

  it("uses uppercase text", () => {
    render(<Badge>Lowercase</Badge>)
    const badge = screen.getByText("Lowercase")
    expect(badge).toHaveClass("uppercase")
  })

  it("renders destructive variant correctly", () => {
    render(<Badge variant="destructive">Error</Badge>)
    const badge = screen.getByText("Error")
    expect(badge).toHaveClass("bg-[var(--danger)]")
  })

  it("renders outline variant correctly", () => {
    render(<Badge variant="outline">Outline</Badge>)
    const badge = screen.getByText("Outline")
    expect(badge).toHaveClass("bg-transparent")
    expect(badge).toHaveClass("border-[var(--text-primary)]")
  })
})
