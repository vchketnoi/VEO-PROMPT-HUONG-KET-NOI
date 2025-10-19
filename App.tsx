
import React, { useState, useCallback, useEffect } from 'react';
import { generatePrompts, CharacterInput, SceneInput } from './services/geminiService';
import { Loader } from './components/Loader';
import { Header } from './components/Header';
import { ApiKeyManager } from './components/ApiKeyManager';

const videoTopics = [
    { value: 'health_lifestyle', label: 'Sức khỏe & Đời sống' },
    { value: 'food_cooking', label: 'Ẩm thực & Nấu ăn' },
    { value: 'fitness_bodybuilding', label: 'Thể dục & Thể hình' },
    { value: 'spirituality_buddhism', label: 'Tâm linh & Phật pháp' },
    { value: 'life_stories', label: 'Câu chuyện đời sống' },
    { value: 'entertainment_comedy', label: 'Giải trí & Hài hước' },
    { value: 'news_society', label: 'Tin tức & Xã hội' },
    { value: 'business_mmo', label: 'Kinh doanh & Kiếm tiền online' },
    { value: 'tech_ai', label: 'Công nghệ & AI' },
    { value: 'travel_exploration', label: 'Du lịch & Khám phá' },
    { value: 'music_art', label: 'Âm nhạc & Nghệ thuật' },
    { value: 'education_knowledge', label: 'Giáo dục & Kiến thức' },
    { value: 'diy_creativity', label: 'DIY & Sáng tạo' },
    { value: 'animals_pets', label: 'Động vật & Thú cưng' },
    { value: 'asmr_relaxation', label: 'ASMR & Thư giãn' },
    { value: 'challenges_trends', label: 'Thử thách & Trend' },
    { value: 'product_reviews', label: 'Review sản phẩm' },
    { value: 'short_film_drama', label: 'Phim ngắn & Mini Drama' },
    { value: 'documentary_discovery', label: 'Phim tài liệu & Khám phá' },
    { value: 'inspiration_self_development', label: 'Truyền cảm hứng & Phát triển bản thân' }
];

const artStyles = [
  { value: 'Anime_Japan', label: 'Anime Nhật Bản' },
  { value: 'CCTV_Found_Footage', label: 'CCTV (Camera giám sát) / Đoạn phim tìm thấy' },
  { value: 'Slow_Motion', label: 'Chuyển động chậm' },
  { value: 'Expressionism', label: 'Chủ nghĩa Biểu hiện' },
  { value: 'Surrealism', label: 'Chủ nghĩa Siêu thực' },
  { value: 'Collage_Mixed_Media', label: 'Cắt dán / Truyền thông hỗn hợp' },
  { value: 'Drone_Shot', label: 'Cảnh quay bằng máy bay không người lái' },
  { value: 'One_Shot_Long_Take', label: 'Cảnh quay dài một lần bấm máy' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
  { value: 'cinematic', label: 'Điện Ảnh (Chung)' },
  { value: 'Live_action_cinematic', label: 'Điện ảnh người đóng' },
  { value: 'Corporate_Business', label: 'Doanh nghiệp / Kinh doanh' },
  { value: 'POV_First_person_alias', label: 'Góc nhìn người thứ nhất (POV)' },
  { value: '3d_Cartoon', label: 'Hoạt hình 3D' },
  { value: 'Stop_Motion', label: 'Hoạt hình tĩnh vật (Stop Motion)' },
  { value: 'Horror_Thriller', label: 'Kinh dị / Giật gân' },
  { value: 'Sci_Fi_Futuristic', label: 'Khoa học viễn tưởng / Tương lai' },
  { value: 'Fantasy', label: 'Kỳ ảo / Thần tiên' },
  { value: 'Romantic', label: 'Lãng mạn' },
  { value: 'Handheld_Shaky_Cam', label: 'Máy quay cầm tay rung' },
  { value: 'watercolor', label: 'Màu Nước' },
  { value: 'Pixel_Art_8bit', label: 'Nghệ thuật pixel 8 bit' },
  { value: 'Noir_Black_and_White', label: 'Phim đen trắng / Phong cách Noir' },
  { value: 'Experimental_Art_film', label: 'Phim nghệ thuật thử nghiệm' },
  { value: 'Documentary_style', label: 'Phong cách tài liệu' },
  { value: 'Minecraft_Style', label: 'Phong cách Minecraft' },
  { value: '3d_Pixar', label: 'Phong cách Pixar 3D' },
  { value: 'Social_Media_Style', label: 'Phong cách mạng xã hội' },
  { value: 'Commercial_Advertising', label: 'Quảng cáo thương mại' },
  { value: '3d_CGI_Realistic', label: 'Thực tế 3D CGI' },
  { value: 'Realistic', label: 'Thực tế (Chung)' },
  { value: 'Music_Video_Aesthetic', label: 'Phong cách thẩm mỹ video ca nhạc' },
  { value: 'Minimalist', label: 'Tối giản' },
  { value: 'abstract', label: 'Trừu Tượng' },
].sort((a, b) => a.label.localeCompare(b.label));

interface Character extends CharacterInput {
    id: string;
}

interface Scene extends SceneInput {
    id: string;
}

const App: React.FC = () => {
  const [script, setScript] = useState<string>('');
  const [numberOfPrompts, setNumberOfPrompts] = useState<string>('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [artStyle, setArtStyle] = useState<string>('cinematic');
  const [topic, setTopic] = useState<string>(videoTopics[0].value);
  const [isConsistent, setIsConsistent] = useState<boolean>(true);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [exportFileName, setExportFileName] = useState<string>('veo3-prompts-by-huong');

  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [selectedApiKey, setSelectedApiKey] = useState<string>('');

  useEffect(() => {
    try {
      const storedKeys = localStorage.getItem('veo3-api-keys');
      const storedSelected = localStorage.getItem('veo3-selected-api-key');
      if (storedKeys) {
        const parsedKeys = JSON.parse(storedKeys);
        setApiKeys(parsedKeys);
        if (storedSelected && parsedKeys.includes(storedSelected)) {
          setSelectedApiKey(storedSelected);
        } else if (parsedKeys.length > 0) {
          setSelectedApiKey(parsedKeys[0]);
          localStorage.setItem('veo3-selected-api-key', parsedKeys[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load API keys from localStorage", e);
      localStorage.removeItem('veo3-api-keys');
      localStorage.removeItem('veo3-selected-api-key');
    }
  }, []);

  const handleAddApiKey = (key: string) => {
    if (key && !apiKeys.includes(key)) {
      const newKeys = [...apiKeys, key];
      setApiKeys(newKeys);
      localStorage.setItem('veo3-api-keys', JSON.stringify(newKeys));
      if (!selectedApiKey) {
        setSelectedApiKey(key);
        localStorage.setItem('veo3-selected-api-key', key);
      }
    }
  };

  const handleDeleteApiKey = (keyToDelete: string) => {
    const newKeys = apiKeys.filter(k => k !== keyToDelete);
    setApiKeys(newKeys);
    localStorage.setItem('veo3-api-keys', JSON.stringify(newKeys));
    if (selectedApiKey === keyToDelete) {
      const newSelected = newKeys.length > 0 ? newKeys[0] : '';
      setSelectedApiKey(newSelected);
      localStorage.setItem('veo3-selected-api-key', newSelected);
    }
  };

  const handleSelectApiKey = (key: string) => {
    setSelectedApiKey(key);
    localStorage.setItem('veo3-selected-api-key', key);
  };
  
  const handleGenerate = useCallback(async () => {
    if (!selectedApiKey) {
        setError('Vui lòng thêm và chọn một khóa API trước khi tạo.');
        return;
    }
    if (!script || !numberOfPrompts) {
      setError('Vui lòng cung cấp cả kịch bản và số lượng gợi ý.');
      return;
    }
    const numPrompts = parseInt(numberOfPrompts, 10);
    if (isNaN(numPrompts) || numPrompts <= 0) {
      setError('Vui lòng nhập một số dương hợp lệ cho số lượng gợi ý.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPrompts([]);

    try {
      const charactersToPass = characters.map(({ id, ...rest }) => rest).filter(c => c.name || c.description);
      const scenesToPass = scenes.map(({ id, ...rest }) => rest).filter(s => s.name || s.description);

      const generated = await generatePrompts(
        script, 
        numPrompts, 
        selectedApiKey,
        charactersToPass,
        scenesToPass,
        artStyle,
        topic,
        isConsistent
      );
      setPrompts(generated);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Không thể tạo gợi ý. Đạo diễn AI có thể đang nghỉ ngơi. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  }, [script, numberOfPrompts, selectedApiKey, characters, scenes, artStyle, topic, isConsistent]);

    // Character handlers
    const addCharacter = () => setCharacters(prev => [...prev, { id: crypto.randomUUID(), name: '', description: '' }]);
    const deleteCharacter = (id: string) => setCharacters(prev => prev.filter(char => char.id !== id));
    const handleCharacterChange = (id: string, field: 'name' | 'description', value: string) => {
        setCharacters(prev => prev.map(char => char.id === id ? { ...char, [field]: value } : char));
    };

    // Scene handlers
    const addScene = () => setScenes(prev => [...prev, { id: crypto.randomUUID(), name: '', description: '' }]);
    const deleteScene = (id: string) => setScenes(prev => prev.filter(scene => scene.id !== id));
    const handleSceneChange = (id: string, field: 'name' | 'description', value: string) => {
        setScenes(prev => prev.map(scene => scene.id === id ? { ...scene, [field]: value } : scene));
    };

  const exportToFile = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportTXT = () => {
    const content = prompts.map((p, i) => `${i + 1}. ${p}`).join('\n');
    const finalFileName = (exportFileName.trim() || 'veo3-prompts-by-huong') + '.txt';
    exportToFile(content, finalFileName, 'text/plain;charset=utf-8;');
  };

  const handleExportCSV = () => {
    const header = '"Phân cảnh","Gợi ý"\n';
    const content = prompts.map((p, i) => `${i + 1},"${p.replace(/"/g, '""')}"`).join('\n');
    const finalFileName = (exportFileName.trim() || 'veo3-prompts-by-huong') + '.csv';
    exportToFile(header + content, finalFileName, 'text/csv;charset=utf-8;');
  };

  const handleCopyPrompt = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const isFormValid = script.trim() !== '' && numberOfPrompts.trim() !== '' && !isNaN(parseInt(numberOfPrompts, 10)) && parseInt(numberOfPrompts, 10) > 0 && selectedApiKey !== '';

  const renderOutput = () => {
    if (isLoading) {
        return <Loader />;
    }
    if (error) {
        return (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Lỗi: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }
    if (prompts.length > 0) {
        return (
            <div className="space-y-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold text-brand-secondary">Các Gợi Ý Đã Tạo</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={handleExportTXT} className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors">Xuất .txt</button>
                        <button onClick={handleExportCSV} className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors">Xuất .csv</button>
                    </div>
                </div>
                <div className="pt-2">
                    <label htmlFor="fileName" className="block text-sm font-medium mb-1.5 text-dark-subtle">
                        Tên tệp để xuất
                    </label>
                    <input
                        id="fileName"
                        type="text"
                        value={exportFileName}
                        onChange={(e) => setExportFileName(e.target.value)}
                        placeholder="ví dụ: my-video-prompts"
                        className="w-full p-2 bg-[#1e1e1e] border border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary transition duration-300"
                        aria-label="Tên tệp để xuất"
                    />
                </div>
                <ol className="list-decimal list-inside space-y-3 pt-2">
                    {prompts.map((prompt, index) => (
                        <li key={index} className="bg-[#1e1e1e] p-3 rounded-lg border border-dark-border flex justify-between items-center gap-3">
                        <span className="text-dark-subtle flex-grow pr-2 text-sm">{prompt}</span>
                        <button
                            onClick={() => handleCopyPrompt(prompt, index)}
                            className="group relative flex-shrink-0 p-2 rounded-md bg-gray-600 hover:bg-gray-500 transition-colors"
                            aria-label={copiedIndex === index ? 'Đã sao chép' : 'Sao chép gợi ý'}
                        >
                            {copiedIndex === index ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            )}
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 origin-bottom scale-0 rounded-md bg-gray-800 px-2 py-1 text-xs font-medium text-white shadow-md transition-all duration-200 group-hover:scale-100">
                                {copiedIndex === index ? 'Đã sao chép!' : 'Sao chép'}
                            </span>
                        </button>
                        </li>
                    ))}
                </ol>
            </div>
        );
    }
    return (
        <div className="text-center text-dark-subtle p-8">
            <h3 className="text-xl font-semibold">Bảng điều khiển đầu ra</h3>
            <p className="mt-2">Các gợi ý được tạo của bạn sẽ xuất hiện ở đây.</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-dark-text font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <Header />
      <main className="w-full max-w-7xl mt-6 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-3 flex flex-col space-y-6">
            <ApiKeyManager
                apiKeys={apiKeys}
                selectedApiKey={selectedApiKey}
                onAddKey={handleAddApiKey}
                onDeleteKey={handleDeleteApiKey}
                onSelectKey={handleSelectApiKey}
            />
            <div className="bg-dark-card p-6 rounded-2xl border border-dark-border shadow-2xl space-y-4">
                {/* Script and Number of Prompts */}
                <div>
                    <label htmlFor="script" className="block text-base font-semibold mb-1 text-brand-primary">
                    Kịch Bản Của Bạn
                    </label>
                    <textarea
                    id="script"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Nhập kịch bản video của bạn tại đây..."
                    className="w-full h-40 p-3 bg-[#1e1e1e] border border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary transition duration-300 resize-y"
                    aria-label="Kịch Bản Của Bạn"
                    />
                </div>
                <div>
                    <label htmlFor="numberOfPrompts" className="block text-base font-semibold mb-1 text-brand-primary">
                    Số Lượng Gợi Ý Mong Muốn
                    </label>
                    <input
                    id="numberOfPrompts"
                    type="number"
                    value={numberOfPrompts}
                    onChange={(e) => setNumberOfPrompts(e.target.value)}
                    placeholder="ví dụ: 15"
                    className="w-full p-3 bg-[#1e1e1e] border border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary transition duration-300"
                    min="1"
                    aria-label="Số Lượng Gợi Ý Mong Muốn"
                    />
                    <p className="text-xs text-dark-subtle mt-1.5 ml-1">Mỗi gợi ý tạo ra khoảng 5-8 giây video. Ví dụ: 15 gợi ý sẽ tạo ra video dài khoảng 75-120 giây.</p>
                </div>
                {/* Art Style and Topic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="artStyle" className="block text-base font-semibold mb-1 text-brand-primary">
                        Phong Cách Nghệ Thuật
                        </label>
                        <div className="relative">
                            <select id="artStyle" value={artStyle} onChange={(e) => setArtStyle(e.target.value)} className="w-full p-3 bg-[#1e1e1e] border border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary appearance-none">
                                {artStyles.map((style) => (<option key={style.value} value={style.value}>{style.label}</option>))}
                            </select>
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-dark-subtle">
                                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                            </div>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="topic" className="block text-base font-semibold mb-1 text-brand-primary">
                        Chủ Đề Video
                        </label>
                        <div className="relative">
                            <select id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full p-3 bg-[#1e1e1e] border border-dark-border rounded-lg focus:ring-2 focus:ring-brand-primary appearance-none">
                                {videoTopics.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                            </select>
                             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-dark-subtle">
                                <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Characters and Scenes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-3 p-3 bg-dark-bg rounded-lg border border-dark-border">
                        <h3 className="text-base font-semibold text-brand-primary">Nhân Vật (Không bắt buộc)</h3>
                        {characters.map((char, index) => (
                            <div key={char.id} className="space-y-2 relative">
                                <button onClick={() => deleteCharacter(char.id)} className="absolute -top-1 -right-1 p-0.5 bg-red-600 hover:bg-red-500 rounded-full text-white" aria-label="Xóa nhân vật"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                                <input type="text" value={char.name} onChange={(e) => handleCharacterChange(char.id, 'name', e.target.value)} placeholder={`Tên NV ${index + 1}`} className="w-full p-2 text-sm bg-[#1e1e1e] border border-dark-border rounded-md focus:ring-2 focus:ring-brand-primary" />
                                <textarea value={char.description} onChange={(e) => handleCharacterChange(char.id, 'description', e.target.value)} placeholder={`Mô tả NV ${index + 1}...`} className="w-full h-20 p-2 text-sm bg-[#1e1e1e] border border-dark-border rounded-md focus:ring-2 focus:ring-brand-primary resize-y" />
                            </div>
                        ))}
                        <button onClick={addCharacter} className="w-full flex justify-center items-center gap-2 py-1.5 px-3 text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>Thêm</button>
                    </div>
                    <div className="space-y-3 p-3 bg-dark-bg rounded-lg border border-dark-border">
                        <h3 className="text-base font-semibold text-brand-primary">Bối Cảnh / Chi Tiết</h3>
                         {scenes.map((scene, index) => (
                            <div key={scene.id} className="space-y-2 relative">
                                <button onClick={() => deleteScene(scene.id)} className="absolute -top-1 -right-1 p-0.5 bg-red-600 hover:bg-red-500 rounded-full text-white" aria-label="Xóa bối cảnh"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>
                                <input type="text" value={scene.name} onChange={(e) => handleSceneChange(scene.id, 'name', e.target.value)} placeholder={`Tên BC ${index + 1}`} className="w-full p-2 text-sm bg-[#1e1e1e] border border-dark-border rounded-md focus:ring-2 focus:ring-brand-primary" />
                                <textarea value={scene.description} onChange={(e) => handleSceneChange(scene.id, 'description', e.target.value)} placeholder={`Mô tả BC ${index + 1}...`} className="w-full h-20 p-2 text-sm bg-[#1e1e1e] border border-dark-border rounded-md focus:ring-2 focus:ring-brand-primary resize-y" />
                            </div>
                        ))}
                        <button onClick={addScene} className="w-full flex justify-center items-center gap-2 py-1.5 px-3 text-sm bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>Thêm</button>
                    </div>
                </div>

                {/* Consistency and Generate button */}
                <div className="pt-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input type="checkbox" checked={isConsistent} onChange={(e) => setIsConsistent(e.target.checked)} className="form-checkbox h-5 w-5 text-brand-primary bg-dark-card border-dark-border rounded focus:ring-brand-primary focus:ring-offset-dark-card" />
                        <span className="text-dark-text font-medium">Giữ nhân vật nhất quán (khuyến nghị)</span>
                    </label>
                    <p className="text-xs text-dark-subtle mt-1 ml-8">Đảm bảo AI sử dụng cùng một hình ảnh cho các nhân vật.</p>
                </div>
                 <div className="pt-2">
                    <button onClick={handleGenerate} disabled={isLoading || !isFormValid} className="w-full flex justify-center items-center py-3 px-6 bg-brand-primary text-white font-bold rounded-lg text-lg hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-500/50 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100">
                    {isLoading ? (
                        <><svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Đang đạo diễn...</>
                    ) : 'Tạo Gợi Ý'}
                    </button>
                </div>
            </div>
        </div>

        {/* Right Column: Outputs */}
        <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-8 bg-dark-card p-6 rounded-2xl border border-dark-border shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto">
               {renderOutput()}
            </div>
        </div>
      </main>
    </div>
  );
};

export default App;
