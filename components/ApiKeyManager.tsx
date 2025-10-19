import React, { useState, useEffect } from 'react';

interface ApiKeyManagerProps {
  apiKeys: string[];
  selectedApiKey: string;
  onAddKey: (key: string) => void;
  onDeleteKey: (key: string) => void;
  onSelectKey: (key: string) => void;
}

const maskApiKey = (key: string): string => {
  if (key.length < 8) return '***';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
};

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ 
    apiKeys, 
    selectedApiKey, 
    onAddKey, 
    onDeleteKey, 
    onSelectKey,
}) => {
  const [newApiKey, setNewApiKey] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Open the manager by default if no keys are present
    if (apiKeys.length === 0) {
      setIsOpen(true);
    }
  }, [apiKeys.length]);

  const handleAddClick = () => {
    if (newApiKey.trim()) {
      onAddKey(newApiKey.trim());
      setNewApiKey('');
    }
  };

  return (
    <div className="bg-dark-card rounded-2xl border border-dark-border shadow-2xl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-brand-primary">Cài Đặt & Quản Lý API Key</span>
        <svg
          className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-6 pt-2">
            <div className="space-y-4">
                <h4 className="text-base font-medium text-dark-subtle mb-3">
                    Quản lý khóa API
                </h4>
                <div className="flex space-x-2">
                    <input
                    type="password"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder="Nhập khóa API Google AI mới"
                    className="flex-grow p-2 bg-[#1e1e1e] border border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary"
                    aria-label="Nhập Khóa API Mới"
                    />
                    <button
                    onClick={handleAddClick}
                    className="px-4 py-2 bg-brand-secondary text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                    aria-label="Thêm Khóa API"
                    >
                    Thêm
                    </button>
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-dark-subtle">Khóa đang hoạt động:</label>
                    {apiKeys.length > 0 ? (
                        <select 
                            value={selectedApiKey} 
                            onChange={(e) => onSelectKey(e.target.value)}
                            className="w-full p-2 bg-[#1e1e1e] border border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary"
                            aria-label="Chọn Khóa API Đang Hoạt Động"
                        >
                            {apiKeys.map(key => (
                                <option key={key} value={key}>{maskApiKey(key)}</option>
                            ))}
                        </select>
                    ) : (
                    <p className="text-dark-subtle italic">Chưa có khóa API nào được thêm. Hãy thêm một khóa ở trên để bắt đầu.</p>
                    )}
                </div>
                {apiKeys.length > 0 && (
                    <div>
                    <h4 className="text-sm font-medium text-dark-subtle mb-2">Quản lý các khóa đã lưu:</h4>
                    <ul className="space-y-2">
                        {apiKeys.map(key => (
                        <li key={key} className="flex items-center justify-between bg-[#1e1e1e] p-2 rounded-lg">
                            <span className="font-mono text-sm">{maskApiKey(key)}</span>
                            <button
                            onClick={() => onDeleteKey(key)}
                            className="text-red-400 hover:text-red-300"
                            aria-label={`Xóa khóa kết thúc bằng ${key.slice(-4)}`}
                            >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                            </svg>
                            </button>
                        </li>
                        ))}
                    </ul>
                    </div>
                )}
            </div>
            
            <p className="text-xs text-dark-subtle italic text-center pt-6 border-t border-dark-border mt-6">
                Các khóa API của bạn được lưu trữ an toàn trong bộ nhớ cục bộ của trình duyệt và không bao giờ được gửi đi nơi khác.
            </p>
        </div>
      )}
    </div>
  );
};
