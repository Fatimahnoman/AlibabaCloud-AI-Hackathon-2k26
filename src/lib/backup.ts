import { copyFile, mkdir, readdir, stat, unlink, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

export interface CreateBackupResult {
  path: string;
  sizeBytes: number;
  timestamp: string;
}

export interface BackupInfo {
  filename: string;
  sizeBytes: number;
  createdAt: string;
}

export interface RestoreResult {
  success: boolean;
  restoredFrom: string;
}

export class BackupManager {
  private readonly defaultBackupDir: string;
  private readonly sourceDbPath: string;

  constructor(projectRoot: string = process.cwd()) {
    this.defaultBackupDir = path.join(projectRoot, 'backups');
    this.sourceDbPath = path.join(projectRoot, 'prisma', 'dev.db');
  }

  private resolveBackupDir(backupDir?: string): string {
    return backupDir ? path.resolve(backupDir) : this.defaultBackupDir;
  }

  async createBackup(backupDir?: string): Promise<CreateBackupResult> {
    const dir = this.resolveBackupDir(backupDir);
    const timestamp = new Date().toISOString();
    const filename = `dev-backup-${timestamp.replace(/[:.]/g, '-')}.db`;
    const destinationPath = path.join(dir, filename);

    try {
      await mkdir(dir, { recursive: true });
      await copyFile(this.sourceDbPath, destinationPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`Source database not found at ${this.sourceDbPath}`);
      }
      if ((error as NodeJS.ErrnoException).code === 'EACCES') {
        throw new Error(`Permission denied while writing backup to ${destinationPath}`);
      }
      throw new Error(`Failed to create backup: ${(error as Error).message}`);
    }

    const stats = await stat(destinationPath);
    return { path: destinationPath, sizeBytes: stats.size, timestamp };
  }

  async listBackups(backupDir?: string): Promise<BackupInfo[]> {
    const dir = this.resolveBackupDir(backupDir);
    let entries: string[];

    try {
      entries = await readdir(dir);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      if ((error as NodeJS.ErrnoException).code === 'EACCES') {
        throw new Error(`Permission denied while reading backup directory ${dir}`);
      }
      throw new Error(`Failed to list backups in ${dir}: ${(error as Error).message}`);
    }

    const dbFiles = entries.filter((entry) => entry.endsWith('.db'));

    const backups = await Promise.all(
      dbFiles.map(async (filename) => {
        const filePath = path.join(dir, filename);
        try {
          const stats = await stat(filePath);
          return {
            filename,
            sizeBytes: stats.size,
            createdAt: stats.mtime.toISOString(),
          } satisfies BackupInfo;
        } catch (error) {
          throw new Error(`Failed to stat backup file ${filePath}: ${(error as Error).message}`);
        }
      })
    );

    return backups.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async restoreBackup(backupPath: string): Promise<RestoreResult> {
    const resolvedBackupPath = path.resolve(backupPath);

    try {
      await access(resolvedBackupPath, constants.F_OK);
      await mkdir(path.dirname(this.sourceDbPath), { recursive: true });
      await copyFile(resolvedBackupPath, this.sourceDbPath);
      return { success: true, restoredFrom: resolvedBackupPath };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { success: false, restoredFrom: resolvedBackupPath };
      }
      if ((error as NodeJS.ErrnoException).code === 'EACCES') {
        throw new Error(
          `Permission denied while restoring backup from ${resolvedBackupPath} to ${this.sourceDbPath}`
        );
      }
      throw new Error(`Failed to restore backup: ${(error as Error).message}`);
    }
  }

  async cleanupOldBackups(keepCount: number = 10): Promise<string[]> {
    const backups = await this.listBackups();
    const staleBackups = backups.slice(keepCount);
    const deleted: string[] = [];

    for (const backup of staleBackups) {
      const filePath = path.join(this.defaultBackupDir, backup.filename);
      try {
        await unlink(filePath);
        deleted.push(backup.filename);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw new Error(`Failed to delete old backup ${filePath}: ${(error as Error).message}`);
        }
      }
    }

    return deleted;
  }
}

export const backupManager = new BackupManager();
