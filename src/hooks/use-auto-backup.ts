/**
 * Auto-backup hook.
 *
 * Strategi:
 * 1. Setiap kali data berubah, simpan snapshot ke IndexedDB key 'jg_autobackup'
 *    (ini beda dari backup manual — tidak perlu download file)
 * 2. Setiap app dibuka, cek apakah ada auto-backup yang lebih baru dari data aktif
 * 3. Trigger download otomatis kalau sudah > AUTO_BACKUP_DAYS hari sejak backup manual terakhir
 *    DAN ada perubahan data sejak backup terakhir
 */

import { useEffect, useRef } from 'react';
import { storageSet, storageGet } from '@/lib/storage';
import type { BackupData } from '@/types';

const AUTO_BACKUP_DAYS = 3; // lebih agresif dari reminder 7 hari

interface AutoBackupOptions {
  data: BackupData;
  lastBackupDate: string | null;
  onAutoBackupDone: (date: string) => void;
  enabled?: boolean;
}

export function useAutoBackup({
  data,
  lastBackupDate,
  onAutoBackupDone,
  enabled = true,
}: AutoBackupOptions) {
  const prevDataRef = useRef<string>('');
  const autoBackupTriggeredRef = useRef(false);

  // 1. Simpan snapshot ke IDB setiap kali data berubah (debounced 2 detik)
  useEffect(() => {
    if (!enabled) return;
    const serialized = JSON.stringify(data);
    if (serialized === prevDataRef.current) return;
    prevDataRef.current = serialized;

    const timer = setTimeout(() => {
      storageSet('jg_autobackup', {
        ...data,
        autoSavedAt: new Date().toISOString(),
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [data, enabled]);

  // 2. Cek apakah perlu auto-download backup
  useEffect(() => {
    if (!enabled || autoBackupTriggeredRef.current) return;

    // Hitung hari sejak backup terakhir
    const daysSinceBackup = lastBackupDate
      ? (Date.now() - new Date(lastBackupDate).getTime()) / 86400000
      : Infinity;

    if (daysSinceBackup < AUTO_BACKUP_DAYS) return;

    // Cek apakah ada data yang perlu di-backup (minimal ada 1 kelas dengan siswa)
    const hasData = data.kelasList.some(k => k.students.length > 0);
    if (!hasData) return;

    // Cek apakah data sudah berubah sejak backup terakhir
    const lastAutoBackup = storageGet<BackupData | null>('jg_autobackup', null);
    const lastAutoSave = lastAutoBackup
      ? (lastAutoBackup as BackupData & { autoSavedAt?: string }).autoSavedAt
      : null;

    // Kalau ada auto-save yang lebih baru dari backup manual, trigger download
    const shouldDownload = !lastBackupDate ||
      (lastAutoSave && lastAutoSave > (lastBackupDate + 'T00:00:00.000Z'));

    if (!shouldDownload) return;

    autoBackupTriggeredRef.current = true;

    // Delay sedikit supaya tidak langsung muncul saat app baru buka
    const timer = setTimeout(() => {
      triggerAutoDownload(data, onAutoBackupDone);
    }, 5000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastBackupDate, enabled]);
}

function triggerAutoDownload(data: BackupData, onDone: (date: string) => void) {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const today = new Date().toISOString().split('T')[0];
    a.download = `auto_backup_jurnal_guru_${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onDone(today);
  } catch {
    // silent — jangan crash app karena backup gagal
  }
}
