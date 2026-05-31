import { render, screen } from "@testing-library/react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./card"

describe("Card - Clean Modern Style", () => {
  it("renders with rounded-xl, border, and shadow", () => {
    render(<Card>Card content</Card>)
    const card = screen.getByText("Card content")
    expect(card).toHaveClass("rounded-xl")
    expect(card).toHaveClass("border")
    expect(card).toHaveClass("shadow-sm")
  })

  it("uses card background", () => {
    render(<Card>Background</Card>)
    const card = screen.getByText("Background")
    expect(card).toHaveClass("bg-[var(--bg-card)]")
  })

  it("CardHeader has bottom border", () => {
    render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>
    )
    const header = screen.getByText("Header")
    expect(header).toHaveClass("border-b")
  })

  it("CardTitle uses regular font (not monospace)", () => {
    render(
      <Card>
        <CardTitle>Test Title</CardTitle>
      </Card>
    )
    const title = screen.getByText("Test Title")
    expect(title).not.toHaveClass("font-mono")
    expect(title).not.toHaveClass("uppercase")
  })

  it("CardFooter has top border", () => {
    render(
      <Card>
        <CardFooter>Footer</CardFooter>
      </Card>
    )
    const footer = screen.getByText("Footer")
    expect(footer).toHaveClass("border-t")
  })
})
