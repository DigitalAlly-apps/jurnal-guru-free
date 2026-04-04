import { useState } from 'react';
import { Search, Trash2, Pencil, Check, X, Filter } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { AbsenRecord, KasusRecord, PeriodeUjian } from '@/types';

type FilterType = 'semua' | 'absen' | 'kasus';

const STATUS_LABEL: Record<string, string> = { H: 'Hadir', S: 'Sakit', I: 'Izin', A: 'Alpa' };
const STATUS_COLOR: Record<string, string> = {
  H: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  S: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  I: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  A: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function RiwayatPage() {
  const {
    absenRecords, updateAbsenRecord, deleteAbsenRecord,
    kasusRecords, updateKasusRecord, deleteKasusRecord,
    kelasList, activeKelas, showToast,
  } = useApp();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('semua');
  const [editId, setEditId] = useState<string | null>(null);
  const [editType, setEditType] = useState<'absen' | 'kasus' | null>(null);
  const [editData, setEditData] = useState<Partial<AbsenRecord & KasusRecord>>({});
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; type: 'absen' | 'kasus' } | null>(null);

  const kelasName = kelasList.find(k => k.id === activeKelas)?.name || '';

  const absenFiltered = absenRecords
    .filter(r => r.kelasId === activeKelas)
    .filter(r => r.studentName.toLowerCase().includes(search.toLowerCase()) || r.date.includes(search));

  const kasusFiltered = kasusRecords
    .filter(r => r.kelasId === activeKelas)
    .filter(r => r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) || r.date.includes(search));

  const startEdit = (id: string, type: 'absen' | 'kasus') => {
    setEditId(id);
    setEditType(type);
    if (type === 'absen') {
      const r = absenRecords.find(r => r.id === id)!;
      setEditData({ status: r.status, periodeUjian: r.periodeUjian, date: r.date });
    } else {
      const r = kasusRecords.find(r => r.id === id)!;
      setEditData({ description: r.description, category: r.category, periodeUjian: r.periodeUjian, date: r.date });
    }
  };

  const saveEdit = () => {
    if (!editId || !editType) return;
    if (editType === 'absen') {
      updateAbsenRecord(editId, editData);
    } else {
      updateKasusRecord(editId, editData);
    }
    showToast('Data berhasil diperbarui');
    setEditId(null); setEditType(null); setEditData({});
  };

  const doDelete = () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'absen') deleteAbsenRecord(confirmDelete.id);
    else deleteKasusRecord(confirmDelete.id);
    showToast('Data berhasil dihapus');
    setConfirmDelete(null);
  };

  const periodeOptions: PeriodeUjian[] = ['Harian', 'UTS', 'UAS'];

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {/* Search & Filter */}
      <div className="bg-surface rounded-2xl shadow-soft p-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama siswa, tanggal, atau deskripsi..."
            className="w-full pl-9 pr-4 py-2.5 bg-bg-2 border border-border rounded-xl text-sm text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <Filter className="w-4 h-4 text-text-tertiary mt-0.5 flex-shrink-0" />
          {(['semua', 'absen', 'kasus'] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f ? 'bg-primary text-white' : 'bg-bg-2 text-text-secondary hover:bg-bg-3'}`}>
              {f === 'semua' ? 'Semua' : f === 'absen' ? 'Absensi' : 'Kasus'}
            </button>
          ))}
        </div>
      </div>

      {/* Absensi Records */}
      {(filter === 'semua' || filter === 'absen') && (
        <div className="bg-surface rounded-2xl shadow-soft overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Riwayat Absensi</span>
            <span className="text-xs text-text-tertiary">— Kelas {kelasName}</span>
            <span className="ml-auto text-xs bg-bg-2 px-2 py-0.5 rounded-full text-text-secondary">{absenFiltered.length} data</span>
          </div>
          {absenFiltered.length === 0 ? (
            <p className="text-center text-text-tertiary text-sm py-8">Tidak ada data absensi</p>
          ) : (
            <div className="divide-y divide-border">
              {absenFiltered.sort((a,b) => b.date.localeCompare(a.date)).map(r => (
                <div key={r.id} className="px-4 py-3">
                  {editId === r.id && editType === 'absen' ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-foreground">{r.studentName}</p>
                      <div className="flex gap-2 flex-wrap">
                        <input type="date" value={editData.date || ''} onChange={e => setEditData(p => ({ ...p, date: e.target.value }))}
                          className="input-soft text-xs flex-1 min-w-[130px]" />
                        <select value={editData.status || 'H'} onChange={e => setEditData(p => ({ ...p, status: e.target.value as any }))}
                          className="input-soft text-xs flex-1">
                          {['H','S','I','A'].map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                        </select>
                        <select value={editData.periodeUjian || 'Harian'} onChange={e => setEditData(p => ({ ...p, periodeUjian: e.target.value as PeriodeUjian }))}
                          className="input-soft text-xs flex-1">
                          {periodeOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditId(null)} className="btn-soft btn-secondary-soft px-3 py-1.5 text-xs flex items-center gap-1"><X className="w-3 h-3"/>Batal</button>
                        <button onClick={saveEdit} className="btn-soft btn-primary-soft px-3 py-1.5 text-xs flex items-center gap-1"><Check className="w-3 h-3"/>Simpan</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{r.studentName}</p>
                        <p className="text-xs text-text-tertiary">{r.date} {r.periodeUjian && <span className="ml-1 text-primary font-medium">· {r.periodeUjian}</span>}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${STATUS_COLOR[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                      <button onClick={() => startEdit(r.id, 'absen')} className="p-1.5 hover:bg-bg-2 rounded-lg transition-colors text-text-secondary hover:text-primary">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete({ id: r.id, type: 'absen' })} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-text-secondary hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Kasus Records */}
      {(filter === 'semua' || filter === 'kasus') && (
        <div className="bg-surface rounded-2xl shadow-soft overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">Riwayat Kasus</span>
            <span className="text-xs text-text-tertiary">— Kelas {kelasName}</span>
            <span className="ml-auto text-xs bg-bg-2 px-2 py-0.5 rounded-full text-text-secondary">{kasusFiltered.length} data</span>
          </div>
          {kasusFiltered.length === 0 ? (
            <p className="text-center text-text-tertiary text-sm py-8">Tidak ada data kasus</p>
          ) : (
            <div className="divide-y divide-border">
              {kasusFiltered.sort((a,b) => b.date.localeCompare(a.date)).map(r => (
                <div key={r.id} className="px-4 py-3">
                  {editId === r.id && editType === 'kasus' ? (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-semibold text-foreground">{r.studentName}</p>
                      <input type="date" value={editData.date || ''} onChange={e => setEditData(p => ({ ...p, date: e.target.value }))}
                        className="input-soft text-xs" />
                      <input value={editData.description || ''} onChange={e => setEditData(p => ({ ...p, description: e.target.value }))}
                        placeholder="Deskripsi kasus" className="input-soft text-xs" />
                      <div className="flex gap-2">
                        <input value={editData.category || ''} onChange={e => setEditData(p => ({ ...p, category: e.target.value }))}
                          placeholder="Kategori" className="input-soft text-xs flex-1" />
                        <select value={editData.periodeUjian || 'Harian'} onChange={e => setEditData(p => ({ ...p, periodeUjian: e.target.value as PeriodeUjian }))}
                          className="input-soft text-xs flex-1">
                          {periodeOptions.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditId(null)} className="btn-soft btn-secondary-soft px-3 py-1.5 text-xs flex items-center gap-1"><X className="w-3 h-3"/>Batal</button>
                        <button onClick={saveEdit} className="btn-soft btn-primary-soft px-3 py-1.5 text-xs flex items-center gap-1"><Check className="w-3 h-3"/>Simpan</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-foreground">{r.studentName}</p>
                          <span className="text-xs bg-bg-2 text-text-secondary px-2 py-0.5 rounded-full">{r.category}</span>
                          {r.periodeUjian && <span className="text-xs text-primary font-medium">{r.periodeUjian}</span>}
                        </div>
                        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{r.description}</p>
                        <p className="text-xs text-text-tertiary mt-0.5">{r.date}</p>
                      </div>
                      <div className="flex flex-shrink-0">
                        <button onClick={() => startEdit(r.id, 'kasus')} className="p-1.5 hover:bg-bg-2 rounded-lg transition-colors text-text-secondary hover:text-primary">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setConfirmDelete({ id: r.id, type: 'kasus' })} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-text-secondary hover:text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl shadow-lg p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-foreground mb-2">Hapus Data?</h3>
            <p className="text-sm text-text-secondary mb-5">Data yang dihapus tidak dapat dikembalikan.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 btn-soft btn-secondary-soft py-2.5 text-sm">Batal</button>
              <button onClick={doDelete} className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
