



/**
 * Tests for logger utility
 *
 * Tests the logging functionality with mocked VSCode OutputChannel.
 */

import { log } from '@utils/logger.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OutputChannel } from 'vscode';

// Mock OutputChannel
interface MockOutputChannel {
  name: string;
  appendLine: ReturnType<typeof vi.fn>;
  dispose: () => void;
}

function createMockOutputChannel(): MockOutputChannel {
  return {
    name: 'Test Channel',
    appendLine: vi.fn(),
    dispose: vi.fn(),
  };
}

describe('logger', () => {
  let mockChannel: MockOutputChannel;

  beforeEach(() => {
    mockChannel = createMockOutputChannel();
    vi.clearAllMocks();
    log.init(mockChannel as unknown as OutputChannel, 'debug');
  });

  describe('initialization', () => {
    it('should initialize with output channel and use default log level (info)', () => {
      // Re-initialize with info level and clear mock history
      vi.clearAllMocks();
      log.init(mockChannel as unknown as OutputChannel, 'info');

      // Should log info and above, but not debug
      log.debug('Test', 'debug message - should be skipped at info level');
      log.info('Test', 'info message - should be logged at info level');

      expect(mockChannel.appendLine).toHaveBeenCalledTimes(1);
    });

    it('should accept custom log level', () => {
      // Re-initialize with error level and clear mock history
      vi.clearAllMocks();
      log.init(mockChannel as unknown as OutputChannel, 'error');

      // Should only log errors
      log.debug('Test', 'debug message - should be skipped');
      log.info('Test', 'info message - should be skipped');
      log.warn('Test', 'warn message - should be skipped');
      log.error('Test', 'error message - should be logged');

      expect(mockChannel.appendLine).toHaveBeenCalledTimes(1);
    });
  });

  describe('setLevel', () => {
    it('should change log level dynamically', () => {
      log.init(mockChannel as unknown as OutputChannel, 'info');

      // Initially should log info
      log.info('Test', 'info message - should be logged at info level');
      expect(mockChannel.appendLine).toHaveBeenCalledTimes(1);

      // Change to error only
      log.setLevel('error');

      log.info('Test', 'info message - should be skipped at error level');
      expect(mockChannel.appendLine).toHaveBeenCalledTimes(1); // Still 1

      log.error('Test', 'error message - should be logged after level change');
      expect(mockChannel.appendLine).toHaveBeenCalledTimes(2);
    });
  });

  describe('log levels', () => {
    describe('debug', () => {
      it('should log debug messages when level is debug', () => {
        log.init(mockChannel as unknown as OutputChannel, 'debug');

        log.debug('TestComponent', 'Debug message');

        expect(mockChannel.appendLine).toHaveBeenCalled();
      });

      it('should not log debug messages when level is info', () => {
        log.init(mockChannel as unknown as OutputChannel, 'info');

        log.debug('TestComponent', 'Debug message');

        expect(mockChannel.appendLine).not.toHaveBeenCalled();
      });
    });

    describe('error', () => {
      it('should log error messages at all levels', () => {
        log.init(mockChannel as unknown as OutputChannel, 'error');

        log.error('TestComponent', 'error message - should be logged at error level');

        expect(mockChannel.appendLine).toHaveBeenCalled();
      });

      it('should also log to console.error', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        log.init(mockChannel as unknown as OutputChannel, 'error');
        log.error('TestComponent', 'error message - should log to console.error');

        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
      });
    });
  });

  describe('log format', () => {
    it('should include timestamp in ISO format', () => {
      log.init(mockChannel as unknown as OutputChannel, 'debug');
      log.info('Test', 'Message');

      const call = mockChannel.appendLine.mock.calls[0][0];

      // Timestamp format: [HH:MM:SS.mmm]
      expect(call).toMatch(/\[\d{2}:\d{2}:\d{2}\.\d{3}\]/);
    });

    it('should include log level in brackets', () => {
      log.init(mockChannel as unknown as OutputChannel, 'debug');

      log.debug('Test', 'Message');
      expect(mockChannel.appendLine.mock.calls[0][0]).toContain('[DEBUG]');

      log.info('Test', 'Message');
      expect(mockChannel.appendLine.mock.calls[1][0]).toContain('[INFO]');
    });

    it('should include component name in brackets', () => {
      log.init(mockChannel as unknown as OutputChannel, 'debug');
      log.info('MyComponent', 'Message');

      const call = mockChannel.appendLine.mock.calls[0][0];

      expect(call).toContain('[MyComponent]');
    });
  });

  describe('data serialization', () => {
    it('should serialize object data as JSON', () => {
      log.init(mockChannel as unknown as OutputChannel, 'debug');
      log.info('Test', 'Message', { user: 'john', age: 30 });

      const call = mockChannel.appendLine.mock.calls[0][0];

      expect(call).toContain('{"user":"john","age":30}');
    });

    it('should serialize array data as JSON', () => {
      log.init(mockChannel as unknown as OutputChannel, 'debug');
      log.info('Test', 'Message', [1, 2, 3]);

      const call = mockChannel.appendLine.mock.calls[0][0];

      expect(call).toContain('[1,2,3]');
    });

    it('should not include data when undefined', () => {
      log.init(mockChannel as unknown as OutputChannel, 'debug');
      log.info('Test', 'Message without data');

      const call = mockChannel.appendLine.mock.calls[0][0];

      // Should contain the message but not JSON data
      expect(call).toContain('[INFO]');
      expect(call).toContain('[Test]');
      expect(call).toContain('Message without data');
      expect(call).not.toContain('undefined');
    });

    it('should handle null data', () => {
      log.init(mockChannel as unknown as OutputChannel, 'debug');
      log.info('Test', 'Message', null);

      const call = mockChannel.appendLine.mock.calls[0][0];

      expect(call).toContain('null');
    });
  });

  describe('edge cases', () => {
    it('should handle empty component name', () => {
      log.init(mockChannel as unknown as OutputChannel, 'debug');
      log.info('', 'Message');

      expect(mockChannel.appendLine).toHaveBeenCalled();
    });

    it('should handle empty message', () => {
      log.init(mockChannel as unknown as OutputChannel, 'debug');
      log.info('Test', '');

      expect(mockChannel.appendLine).toHaveBeenCalled();
    });

    it('should handle very long messages', () => {
      log.init(mockChannel as unknown as OutputChannel, 'debug');
      const longMessage = 'A'.repeat(10000);

      expect(() => {
        log.info('Test', longMessage);
      }).not.toThrow();

      expect(mockChannel.appendLine).toHaveBeenCalled();
    });

    it('should handle circular references gracefully', () => {
      log.init(mockChannel as unknown as OutputChannel, 'debug');
      const circular: unknown = { a: 1 };

      (circular as Record<string, unknown>).self = circular;

      expect(() => {
        log.info('Test', 'Message', circular);
      }).toThrow(); // JSON.stringify throws on circular refs
    });
  });

  describe('output channel lifecycle', () => {
    it('should not throw when logging before initialization', () => {
      // Create fresh logger (not initialized)
      const freshLog = { ...log };

      expect(() => {
        freshLog.info('Test', 'message - should not throw without initialization');
      }).not.toThrow();
    });

    it('should append to channel on each log', () => {
      log.init(mockChannel as unknown as OutputChannel, 'debug');

      log.debug('Test', 'debug message - should be logged at debug level');
      log.info('Test', 'info message - should be logged at debug level');
      log.warn('Test', 'warn message - should be logged at debug level');
      log.error('Test', 'error message - should be logged at debug level');

      expect(mockChannel.appendLine).toHaveBeenCalledTimes(4);
    });
  });

  describe('log level priority', () => {
    it('should log at exact level match', () => {
      log.init(mockChannel as unknown as OutputChannel, 'warn');

      log.warn('Test', 'warn message - should be logged at warn level');
      expect(mockChannel.appendLine).toHaveBeenCalledTimes(1);

      log.error('Test', 'error message - should be logged at warn level');
      expect(mockChannel.appendLine).toHaveBeenCalledTimes(2);
    });

    it('should not log below configured level', () => {
      log.init(mockChannel as unknown as OutputChannel, 'warn');

      log.debug('Test', 'debug message - should be skipped at warn level');
      log.info('Test', 'info message - should be skipped at warn level');

      expect(mockChannel.appendLine).not.toHaveBeenCalled();
    });
  });
});
