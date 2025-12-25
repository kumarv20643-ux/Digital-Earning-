
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI } from '@google/genai';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

import { UserStats, VideoItem, TabType } from './types';
import { INITIAL_PLACEHOLDERS } from './constants';
import { generateId } from './utils';

import { 
    ThinkingIcon, 
    HomeIcon, 
    WalletIcon, 
    VideoIcon, 
    UsersIcon,
    ArrowUpIcon,
    ShareIcon
} from './components/Icons';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [stats, setStats] = useState<UserStats>({
      balance: 145.50,
      coins: 2400,
      referrals: { l1: 12, l2: 24, l3: 45 },
      todayEarnings: 12.00
  });

  const [videos, setVideos] = useState<VideoItem[]>([
      { id: '1', title: 'Earn ₹10 Watching this', url: 'https://youtube.com/watch?v=1', reward: 10, status: 'approved', views: 1200 },
      { id: '2', title: 'Daily Bonus Video', url: 'https://youtube.com/watch?v=2', reward: 5, status: 'approved', views: 800 },
      { id: '3', title: 'New Viral Status', url: 'https://youtube.com/watch?v=3', reward: 3, status: 'approved', views: 2400 },
  ]);

  const [uploadUrl, setUploadUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rewardingVideoId, setRewardingVideoId] = useState<string | null>(null);

  // Gemini logic for link validation and rewarding
  const handleWatchVideo = async (video: VideoItem) => {
      if (rewardingVideoId) return;
      setRewardingVideoId(video.id);
      
      // Simulate watching duration
      setTimeout(() => {
          setStats(prev => ({
              ...prev,
              balance: prev.balance + video.reward,
              todayEarnings: prev.todayEarnings + video.reward
          }));
          setRewardingVideoId(null);
          alert(`बधाई हो! आपने ₹${video.reward} कमाए।`);
      }, 3000);
  };

  const handleUploadLink = async () => {
    if (!uploadUrl.trim()) return;
    setIsUploading(true);

    try {
        const apiKey = process.env.API_KEY;
        const ai = new GoogleGenAI({ apiKey });
        
        // Use Gemini to "review" the link and generate a catchy title
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { 
                role: 'user', 
                parts: [{ 
                    text: `Review this YouTube link: ${uploadUrl}. 
                    1. Create a catchy Hindi title (less than 40 chars).
                    2. Determine reward based on complexity (₹2, ₹5, or ₹10).
                    Return JSON: { "title": "Hindi Title", "reward": 5 }` 
                }] 
            },
            config: { responseMimeType: 'application/json' }
        });

        const data = JSON.parse(response.text);
        
        const newVideo: VideoItem = {
            id: generateId(),
            title: data.title,
            url: uploadUrl,
            reward: data.reward,
            status: 'approved',
            views: 0
        };

        setVideos(prev => [newVideo, ...prev]);
        setUploadUrl('');
        alert("वीडियो सफलतापूर्वक अपलोड हो गया!");
    } catch (e) {
        console.error(e);
        alert("त्रुटि: लिंक की समीक्षा नहीं की जा सकी।");
    } finally {
        setIsUploading(false);
    }
  };

  const renderHome = () => (
    <div className="content-section">
        <div className="stat-grid">
            <div className="stat-box">
                <div className="label">आज की कमाई</div>
                <div className="value">₹{stats.todayEarnings.toFixed(2)}</div>
            </div>
            <div className="stat-box">
                <div className="label">कुल कोइन्स</div>
                <div className="value">{stats.coins} 🪙</div>
            </div>
        </div>

        <div className="section-title">
            <span>देखें और कमाएं (Watch & Earn)</span>
        </div>

        {videos.map(video => (
            <div key={video.id} className="video-card" onClick={() => handleWatchVideo(video)}>
                <div className="video-thumb">
                    {rewardingVideoId === video.id ? <ThinkingIcon /> : <VideoIcon />}
                </div>
                <div className="video-info">
                    <h4>{video.title}</h4>
                    <div className="video-reward">कमाने का मौका: ₹{video.reward}</div>
                </div>
            </div>
        ))}

        <div className="withdraw-status">
            अगला विड्रॉल ₹300 पर उपलब्ध होगा। आपके पास ₹{stats.balance.toFixed(2)} हैं।
        </div>
    </div>
  );

  const renderEarn = () => (
    <div className="content-section">
        <div className="section-title">अपना वीडियो डालें</div>
        <p style={{color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px'}}>
            YouTube वीडियो लिंक शेयर करें और जब लोग देखेंगे तो आप कमाएंगे।
        </p>

        <div className="input-group">
            <label>YouTube Link</label>
            <input 
                type="text" 
                placeholder="https://youtube.com/..." 
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                disabled={isUploading}
            />
        </div>

        <button 
            className="btn-primary" 
            onClick={handleUploadLink}
            disabled={isUploading || !uploadUrl}
        >
            {isUploading ? <ThinkingIcon /> : 'सबमिट करें (Submit)'}
        </button>

        <div style={{marginTop: '30px'}} className="section-title">नियम</div>
        <ul style={{color: 'var(--text-secondary)', paddingLeft: '20px', fontSize: '0.85rem'}}>
            <li>केवल वैध YouTube लिंक ही स्वीकार किए जाते हैं।</li>
            <li>वीडियो 30 सेकंड से ज्यादा का होना चाहिए।</li>
            <li>गलत लिंक डालने पर अकाउंट ब्लॉक हो सकता है।</li>
        </ul>
    </div>
  );

  const renderRefer = () => (
    <div className="content-section">
        <div className="section-title">रेफरल प्रोग्राम (3 Levels)</div>
        
        <div className="level-card">
            <div className="level-info">
                <span className="level-name">Level 1 (Direct)</span>
                <span className="level-count">{stats.referrals.l1} यूज़र्स</span>
            </div>
            <div className="video-reward">₹5/refer</div>
        </div>

        <div className="level-card">
            <div className="level-info">
                <span className="level-name">Level 2</span>
                <span className="level-count">{stats.referrals.l2} यूज़र्स</span>
            </div>
            <div className="video-reward">₹2/refer</div>
        </div>

        <div className="level-card">
            <div className="level-info">
                <span className="level-name">Level 3</span>
                <span className="level-count">{stats.referrals.l3} यूज़र्स</span>
            </div>
            <div className="video-reward">₹1/refer</div>
        </div>

        <div style={{marginTop: '30px'}}>
            <button className="btn-primary" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                <ShareIcon /> व्हाट्सएप पर शेयर करें
            </button>
        </div>
    </div>
  );

  const renderWallet = () => (
    <div className="content-section">
        <div className="section-title">वॉलेट विड्रॉल (Withdrawal)</div>
        
        <div className="stat-box" style={{textAlign: 'center', padding: '30px', marginBottom: '20px'}}>
            <div className="label">उपलब्ध बैलेंस</div>
            <div className="balance-amount" style={{fontSize: '3rem'}}>₹{stats.balance.toFixed(2)}</div>
        </div>

        <div className="input-group">
            <label>UPI ID (PhonePe / GPay / Paytm)</label>
            <input type="text" placeholder="yourname@upi" />
        </div>

        <div className="input-group">
            <label>राशि (Amount)</label>
            <input type="number" placeholder="₹300 से अधिक" />
        </div>

        <button 
            className="btn-primary" 
            disabled={stats.balance < 300}
            onClick={() => alert("विड्रॉल के लिए कम से कम ₹300 होने चाहिए।")}
        >
            {stats.balance < 300 ? '₹300 होने पर विड्रॉल करें' : 'अभी विड्रॉल करें'}
        </button>
    </div>
  );

  return (
    <div className="app-shell">
        <header className="dashboard-header">
            <div className="user-welcome">
                <h1>नमस्ते, <span>यूज़र</span></h1>
                <div className="nav-item" onClick={() => window.location.reload()}>
                    <ThinkingIcon />
                </div>
            </div>
            <div className="earnings-card">
                <div className="balance-label">कुल बैलेंस (Total Balance)</div>
                <div className="balance-amount">₹{stats.balance.toFixed(2)}</div>
            </div>
        </header>

        <main>
            {activeTab === 'home' && renderHome()}
            {activeTab === 'earn' && renderEarn()}
            {activeTab === 'refer' && renderRefer()}
            {activeTab === 'wallet' && renderWallet()}
        </main>

        <nav className="bottom-nav">
            <div className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
                <HomeIcon />
                <span>होम</span>
            </div>
            <div className={`nav-item ${activeTab === 'earn' ? 'active' : ''}`} onClick={() => setActiveTab('earn')}>
                <VideoIcon />
                <span>कमाएं</span>
            </div>
            <div className={`nav-item ${activeTab === 'refer' ? 'active' : ''}`} onClick={() => setActiveTab('refer')}>
                <UsersIcon />
                <span>रेफर</span>
            </div>
            <div className={`nav-item ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
                <WalletIcon />
                <span>वॉलेट</span>
            </div>
        </nav>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
