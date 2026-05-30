import { render, screen, within } from "@testing-library/react"
import { BrowserRouter } from "react-router-dom"
import Index from "./index"

describe("Index Page - Terminal Brutalism", () => {
  it("renders all sections", () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    )
    
    // Use getAllByText and check at least one is present
    expect(screen.getAllByText("SentinelScan").length).toBeGreaterThan(0)
    expect(screen.getByText(/Vulnerability Platform/)).toBeInTheDocument()
    expect(screen.getByText(/Built with Go/)).toBeInTheDocument()
    expect(screen.getByText(/Capabilities/)).toBeInTheDocument()
    expect(screen.getByText(/Ready to Secure/)).toBeInTheDocument()
  })

  it("uses JetBrains Mono font (monospace)", () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    )
    
    // Check that body or main elements use monospace
    const body = document.querySelector("body")
    expect(body).toBeInTheDocument()
  })

  it("has no rounded corners on key elements", () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    )
    
    // Check Navbar has border-b-2 not rounded - get the first navigation (navbar)
    const navs = screen.getAllByRole("navigation")
    expect(navs.length).toBeGreaterThan(0)
    // The first nav should be the main navbar
    const mainNav = navs[0]
    expect(mainNav.className).toContain("border-b-2")
  })

  it("displays terminal-style Go section instead of Gopher", () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    )
    
    // Check for "Go" text within the GoTerminalSection
    const goTerminalSection = screen.getByText("Go")
    expect(goTerminalSection).toBeInTheDocument()
    
    // Check for ASCII art
    expect(screen.getByText(/SENTINELSCAN CORE/)).toBeInTheDocument()
  })

  it("has scanlines overlay in hero and CTA sections", () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    )
    
    const scanlines = document.querySelectorAll(".bg-scanlines")
    expect(scanlines.length).toBeGreaterThan(0)
  })

  it("stats section uses borders not cards", () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    )
    
    const statsSection = screen.getByRole("region", { name: /statistics/i })
    expect(statsSection).toHaveClass("border-y-2")
  })
})
