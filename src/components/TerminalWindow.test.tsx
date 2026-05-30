import { render, screen } from "@testing-library/react"
import { TerminalWindow, TerminalLine, SentinelScanTerminal } from "./TerminalWindow"

describe("TerminalWindow - Brutalist Style", () => {
  it("renders with rounded-none and border-2", () => {
    render(<TerminalWindow>Content</TerminalWindow>)
    const terminal = screen.getByText("Content").parentElement
    expect(terminal).toHaveClass("rounded-none")
    expect(terminal).toHaveClass("border-2")
  })

  it("shows scanlines overlay when enabled", () => {
    render(<TerminalWindow showScanlines>Content</TerminalWindow>)
    const overlay = document.querySelector(".bg-scanlines")
    expect(overlay).toBeInTheDocument()
  })

  it("displays custom title", () => {
    render(<TerminalWindow title="custom://terminal">Content</TerminalWindow>)
    expect(screen.getByText("custom://terminal")).toBeInTheDocument()
  })

  it("TerminalLine applies correct color classes", () => {
    render(<TerminalLine content="test" type="critical" />)
    const line = screen.getByText("test")
    expect(line).toHaveClass("text-[var(--danger)]")
  })

  it("SentinelScanTerminal renders all lines", () => {
    render(<SentinelScanTerminal />)
    expect(screen.getByText("$ sentinelscan --target 192.168.1.0/24")).toBeInTheDocument()
    expect(screen.getByText(/CVE-2024-6387/)).toBeInTheDocument()
    expect(screen.getByText("▌")).toBeInTheDocument()
  })

  it("uses monospace font", () => {
    render(<TerminalWindow>Mono</TerminalWindow>)
    const content = screen.getByText("Mono")
    expect(content).toHaveClass("font-mono")
  })
})
