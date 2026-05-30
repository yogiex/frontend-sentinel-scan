/**
 * Tests for logDownload.ts
 * Path: src/lib/logDownload.test.ts
 */
import { downloadTextFile, downloadAccessLog, downloadErrorLog } from './logDownload';

// Mock DOM methods
const mockClick = vi.fn();
const mockAppend = vi.fn();
const mockRemove = vi.fn();

vi.stubGlobal('document', {
  createElement: vi.fn(() => ({
    href: '',
    download: '',
    click: mockClick,
  })),
  body: {
    appendChild: mockAppend,
    removeChild: mockRemove,
  },
});

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn(),
});

describe('logDownload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('downloadTextFile creates a blob and triggers download', () => {
    downloadTextFile('test log content', 'test.log');
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockClick).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
  });

  it('downloadAccessLog uses correct filename', () => {
    const createElementMock = vi.fn(() => ({
      href: '',
      download: '',
      click: mockClick,
    }));
    vi.stubGlobal('document', {
      createElement: createElementMock,
      body: { appendChild: mockAppend, removeChild: mockRemove },
    });

    downloadAccessLog('access log content');
    const createdElement = createElementMock.mock.results[0].value;
    expect(createdElement.download).toBe('sentinelscan.access.log');
  });

  it('downloadErrorLog uses correct filename', () => {
    const createElementMock = vi.fn(() => ({
      href: '',
      download: '',
      click: mockClick,
    }));
    vi.stubGlobal('document', {
      createElement: createElementMock,
      body: { appendChild: mockAppend, removeChild: mockRemove },
    });

    downloadErrorLog('error log content');
    const createdElement = createElementMock.mock.results[0].value;
    expect(createdElement.download).toBe('sentinelscan.error.log');
  });

  it('handles empty content gracefully', () => {
    downloadAccessLog('');
    expect(mockClick).toHaveBeenCalled();
  });
});
