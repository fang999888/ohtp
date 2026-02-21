// main.js 完整整合版（保證所有括號閉合，地圖與表單功能正常）
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

    // ---------- 2. 快速查詢表單提交 ----------
    const quickForm = document.getElementById('quick-check-form');
    if (quickForm) {
        quickForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const houseAge = document.getElementById('house-age').value;
            const floors = document.getElementById('floors').value;
            const city = document.getElementById('city').value;
            if (!houseAge || !floors || !city) {
                alert('請填寫必填欄位：屋齡、樓層數、所在縣市');
                return;
            }

            // 此處保留您的判斷邏輯（可自行擴充）
            alert('表單已送出（分析邏輯請自行加入）');
        });

        // 清除按鈕
        const resetBtn = quickForm.querySelector('button[type="reset"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                quickForm.reset();
            });
        }
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

    // ---------- 4. 地圖與地址查詢 ----------
    const mapDiv = document.getElementById('map');
    const lookupBtn = document.getElementById('btn-lookup');
    const addressInput = document.getElementById('address');
    const zoningDisplay = document.getElementById('zoning-display');
    const citySelect = document.getElementById('city');

    // 如果頁面上有地圖相關元素才執行
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
                const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&accept-language=zh-TW&countrycodes=tw&limit=1&q=${encodeURIComponent(address)}`;
                const response = await fetch(url, {
                    headers: { 'Accept': 'application/json' }
                });
                const data = await response.json();

                if (!data || data.length === 0) {
                    zoningDisplay.innerText = '查不到地址，請輸入更完整的地址';
                    return;
                }

                const result = data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);

                map.setView([lat, lon], 18);
                marker.setLatLng([lat, lon]).setOpacity(1);

                let displayText = `📍 定位成功：${result.display_name}`;
                if (result.address) {
                    const addr = result.address;
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
                displayText += '\n使用分區：住宅區 (模擬資料)';
                zoningDisplay.innerText = displayText;
            } catch (error) {
                console.error('查詢錯誤:', error);
                zoningDisplay.innerText = '查詢失敗，請稍後再試。';
            }
        });
    }
});
