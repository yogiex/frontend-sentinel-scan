import { render, screen } from "@testing-library/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card"

describe("Card - Brutalist Style", () => {
  it("renders with no shadow and rounded-none", () => {
    render(<Card>Card content</Card>)
    const card = screen.getByText("Card content")
    expect(card).toHaveClass("rounded-none")
    expect(card).toHaveClass("border-2")
    expect(card.className).not.toContain("shadow")
  })

  it("uses brutalist background", () => {
    render(<Card>Background</Card>)
    const card = screen.getByText("Background")
    expect(card).toHaveClass("bg-[var(--bg-secondary)]")
  })

  it("CardHeader has bottom border", () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>
    )
    const header = screen.getByText("Header")
    expect(header).toHaveClass("border-b-2")
  })

  it("CardTitle uses monospace and uppercase", () => {
    render(
      <Card>
        <CardTitle>Test Title</CardTitle>
      </Card>
    )
    const title = screen.getByText("Test Title")
    expect(title).toHaveClass("font-mono")
    expect(title).toHaveClass("uppercase")
  })

  it("CardFooter has top border", () => {
    render(
      <Card>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    const footer = screen.getByText("Footer")
    expect(footer).toHaveClass("border-t-2")
  })
})
