// main.js 完整整合版（表單分析 + 地址查詢，支援後端代理）
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ main.js 已載入');

    // ---------- 1. 行動版選單 ----------
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navbarMenu = document.querySelector('.navbar-menu');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
        });
    }

    // ---------- 2. 快速查詢表單提交（原有邏輯）----------
    const quickForm = document.getElementById('quick-check-form');
    if (quickForm) {
        quickForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('✅ 表單送出事件觸發');

            const houseAge = document.getElementById('house-age').value;
            const floors = document.getElementById('floors').value;
            const city = document.getElementById('city').value;

            if (!houseAge || !floors || !city) {
                alert('請填寫必填欄位：屋齡、樓層數、所在縣市');
                return;
            }

            // 以下保留您原有的推薦邏輯（可依實際需求擴充）
            let recommendedPath = '';
            let reason = '';

            if (houseAge === 'under30') {
                recommendedPath = '可能需要等待';
                reason = '您的房屋屋齡未滿30年，目前老宅延壽計畫、危老條例都需屋齡30年以上。建議持續關注未來政策。';
            } else {
                const structure = document.getElementById('structure').value;
                const households = document.getElementById('households').value;

                if (structure === 'danger' || structure === 'major') {
                    recommendedPath = '路徑B：原址改建 (危老)';
                    reason = '您的房屋結構有明顯疑慮，建議優先考慮危老重建，可獲容積獎勵且快速處理安全問題。';
                } else if (households === '1' || households === '2-5') {
                    if (floors === '1-3' || floors === '4-5') {
                        recommendedPath = '路徑B：原址改建 (危老)';
                        reason = '住戶數少、樓層不高，較容易達成100%同意，適合申請危老重建。';
                    } else {
                        recommendedPath = '路徑A：修繕延壽';
                        reason = '樓層較高、住戶較多，危老需100%同意門檻較高，建議先從修繕延壽著手。';
                    }
                } else {
                    if (floors === '6-7' || floors === 'over8') {
                        recommendedPath = '路徑C：都更重建';
                        reason = '您的房屋樓層較高、住戶數多，較符合都更重建的規模，建議諮詢都更輔導團。';
                    } else {
                        recommendedPath = '路徑A：修繕延壽';
                        reason = '建議先申請修繕補助改善居住品質，同時與鄰居討論未來改建可能性。';
                    }
                }
            }

            alert(`初步分析結果：\n\n建議優先考慮：${recommendedPath}\n\n原因：${reason}\n\n此為初步判斷，實際適用方案請諮詢當地政府窗口。`);
        });

        // 清除按鈕
        const resetBtn = quickForm.querySelector('button[type="reset"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                quickForm.reset();
            });
        }
    } else {
        console.error('❌ 找不到表單元素 #quick-check-form');
    }

    // ---------- 3. 導航 active 狀態 ----------
    const currentPath = window.location.pathname;
    document.querySelectorAll('.navbar-menu a').forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.endsWith(linkPath) || 
            (currentPath.endsWith('/') && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });

    // ---------- 4. 地址查詢與地圖（透過後端代理解決 CORS）----------
    const mapDiv = document.getElementById('map');
    const lookupBtn = document.getElementById('btn-lookup');
    const addressInput = document.getElementById('address');
    const zoningDisplay = document.getElementById('zoning-display');
    const citySelect = document.getElementById('city');

    if (mapDiv && lookupBtn) {
        // 初始化 Leaflet 地圖
        const map = L.map('map').setView([23.5, 121], 7);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap 貢獻者'
        }).addTo(map);
        let marker = L.marker([23.5, 121]).addTo(map);
        marker.setOpacity(0); // 預設隱藏

        lookupBtn.addEventListener('click', async function() {
            const address = addressInput.value.trim();
            if (!address) {
                alert('請輸入地址');
                return;
            }
            zoningDisplay.innerText = '查詢中...';

            try {
                // 呼叫自己的後端代理（請確認後端已實作 /get-zoning）
                const response = await fetch('https://ohtp.onrender.com/get-zoning', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address: address })
                });

                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || `HTTP ${response.status}`);
                }

                const data = await response.json();

                // 後端應回傳至少包含 lat, lon, display_name, address 等欄位
                const lat = parseFloat(data.lat);
                const lon = parseFloat(data.lon);

                map.setView([lat, lon], 18);
                marker.setLatLng([lat, lon]).setOpacity(1);

                let displayText = `📍 定位成功：${data.display_name}`;
                if (data.address) {
                    const addr = data.address;
                    const city = addr.city || addr.town || addr.county || '';
                    const district = addr.suburb || addr.neighbourhood || '';
                    displayText += `\n行政區：${city} ${district}`;

                    // 自動選取縣市下拉選單
                    if (citySelect) {
                        const cityMap = {
                            '台北市': 'taipei', '臺北市': 'taipei',
                            '新北市': 'newtaipei', '桃園市': 'taoyuan',
                            '台中市': 'taichung', '臺中市': 'taichung',
                            '台南市': 'tainan', '臺南市': 'tainan',
                            '高雄市': 'kaohsiung'
                        };
                        for (let key in cityMap) {
                            if (city.includes(key)) {
                                citySelect.value = cityMap[key];
                                break;
                            }
                        }
                    }
                }
                // 顯示分區（可從 data.zoning 取得，若無則顯示模擬文字）
                displayText += `\n使用分區：${data.zoning || '住宅區 (模擬)'}`;
                zoningDisplay.innerText = displayText;
            } catch (error) {
                console.error('查詢錯誤:', error);
                zoningDisplay.innerText = `查詢失敗：${error.message}。請稍後再試。`;
            }
        });
    }
});
