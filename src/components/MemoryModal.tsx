import React, { useState } from 'react';
import { 
  Brain, Plus, Trash2, Tag, Calendar, Heart, User, 
  Sparkles, X, Check, Search, AlertCircle, MessageCircle 
} from 'lucide-react';
import { MemoryItem, MemoryCategory } from '../types';

interface MemoryModalProps {
  memories: MemoryItem[];
  onAddMemory: (memory: Omit<MemoryItem, 'id' | 'createdAt'>) => void;
  onDeleteMemory: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  onQuickPrompt?: (prompt: string) => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearAll,
  onClose,
  onQuickPrompt,
}) => {
  const [activeTab, setActiveTab] = useState<MemoryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // New memory form state
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryCategory>('preference');

  const filteredMemories = memories.filter((mem) => {
    const matchesTab = activeTab === 'all' || mem.category === activeTab;
    const matchesSearch = 
      mem.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.value.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    onAddMemory({
      category: newCategory,
      key: newKey.trim(),
      value: newValue.trim(),
      source: 'manual',
    });

    setNewKey('');
    setNewValue('');
    setShowAddForm(false);
  };

  const getCategoryMeta = (cat: MemoryCategory) => {
    switch (cat) {
      case 'profile':
        return { label: 'الملف الشخصي', icon: User, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'event':
        return { label: 'حدث أو مناسبة', icon: Calendar, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'preference':
        return { label: 'تفضيل شخصي', icon: Heart, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      default:
        return { label: 'ملاحظة عامة', icon: Tag, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">ذاكرة مشمش (Memory Module)</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {memories.length} حقائق محفوظة
                </span>
              </div>
              <p className="text-xs text-slate-400">
                تحفظ مشمش تفاصيلك تلقائياً لاسترجاعها في المحادثات القادمة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="p-3 border-b border-slate-800 bg-slate-950/40 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الذاكرة..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة معلومة</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-xs font-medium">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'profile', label: 'الملف الشخصي' },
              { id: 'event', label: 'الأحداث' },
              { id: 'preference', label: 'التفضيلات' },
              { id: 'note', label: 'ملاحظات' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-1 px-2.5 rounded-lg whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Add Memory Form Modal / Collapsible */}
        {showAddForm && (
          <form onSubmit={handleCreate} className="p-4 bg-purple-950/20 border-b border-purple-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>إضافة حقيقة جديدة لذاكرة مشمش</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                إلغاء
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">نوع المعلومة:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="profile">الملف الشخصي (الاسم، المهنة، المكان)</option>
                  <option value="event">حدث أو مناسبة (عيد ميلاد، مقابلة، تخرج)</option>
                  <option value="preference">تفضيل شخصي (مشروب، فنان، أسلوب)</option>
                  <option value="note">ملاحظة عامة</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">عنوان الحقيقة (المفتاح):</label>
                <input
                  type="text"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="مثال: الاسم، المشروب المفضل"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">تفاصيل الحقيقة (القيمة):</label>
              <input
                type="text"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="مثال: علاء، شاي بالنعناع مع سكر خفيف"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="py-1.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1 shadow"
              >
                <Check className="w-3.5 h-3.5" />
                <span>حفظ في الذاكرة</span>
              </button>
            </div>
          </form>
        )}

        {/* Memory Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Brain className="w-12 h-12 text-slate-700 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-300">لا توجد ذكريات في هذا التصنيف</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                تحدث مع مشمش وأخبرها عن نفسك أو أضف معلوماتك يدوياً ليتم تذكرها دائماً!
              </p>
            </div>
          ) : (
            filteredMemories.map((mem, idx) => {
              const meta = getCategoryMeta(mem.category);
              const Icon = meta.icon;
              return (
                <div
                  key={`modal-mem-${mem.id}-${mem.key}-${idx}`}
                  className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 hover:border-slate-700 transition flex items-start justify-between gap-3 group"
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-2 rounded-xl border ${meta.color} mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-200">{mem.key}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {meta.label}
                        </span>
                        {mem.source === 'auto' ? (
                          <span className="text-[10px] text-purple-400 font-medium flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>اكتشاف ذكي</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500">يدوي</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-purple-100/90 mt-1">
                        {mem.value}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMemory(mem.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 opacity-60 group-hover:opacity-100 transition"
                    title="حذف من الذاكرة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}

          {/* Quick Prompts to Test Memory */}
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              جرب اختبار الذاكرة بالأوامر الصوتية السريعة:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'ماذا تعرفين عني يا مشمش؟',
                'اسمي علاء وأحب شرب القهوة مع هيل',
                'عندي مقابلة عمل مهمة الأسبوع القادم',
                'تذكري أنني أسافر يوم الجمعة',
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onQuickPrompt?.(p);
                    onClose();
                  }}
                  className="py-1 px-2.5 rounded-full bg-purple-950/40 border border-purple-800/40 text-purple-200 text-xs hover:bg-purple-900/40 transition flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3 text-purple-400" />
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          {memories.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('هل أنت متأكد من مسح جميع ذكريات مشمش؟')) {
                  onClearAll();
                }
              }}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح كل الذكريات</span>
            </button>
          )}

          <div className="mr-auto">
            <button
              onClick={onClose}
              className="py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
