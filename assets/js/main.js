// 等待 DOM 載入完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ main.js 已載入');

    // 行動版選單切換
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navbarMenu = document.querySelector('.navbar-menu');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            navbarMenu.classList.toggle('active');
        });
    }
    
    // 快速查詢表單處理
    const quickForm = document.getElementById('quick-check-form');
    if (quickForm) {
        console.log('✅ 找到表單元素');
        
        quickForm.addEventListener('submit', function(e) {
            e.preventDefault();  // 阻止表單重新整理頁面
            console.log('✅ 表單送出事件觸發');
            
            // 取得表單資料
            const houseAge = document.getElementById('house-age').value;
            const floors = document.getElementById('floors').value;
            const city = document.getElementById('city').value;
            
            console.log('表單資料：', { houseAge, floors, city });
            
            // 基本驗證
            if (!houseAge || !floors || !city) {
                alert('請填寫必填欄位：屋齡、樓層數、所在縣市');
                return;
            }
            
            // 根據輸入條件判斷最可能適用的路徑
            let recommendedPath = '';
            let reason = '';
            
            if (houseAge === 'under30') {
                recommendedPath = '可能需要等待，目前政策主要針對30年以上老宅';
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
            
            // 顯示結果
            alert(`初步分析結果：\n\n建議優先考慮：${recommendedPath}\n\n原因：${reason}\n\n此為初步判斷，實際適用方案請諮詢當地政府窗口。`);
            
            // 可選：跳轉到比較頁面並帶入參數（未來優化）
            // window.location.href = `pages/compare.html?age=${houseAge}&floors=${floors}&city=${city}`;
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
    
    // 設定當前導航項目的 active 狀態
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-menu a');
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPath.endsWith(linkPath) || 
            (currentPath.endsWith('/') && linkPath === 'index.html')) {
            link.classList.add('active');
        }
    });
});
document.getElementById('btn-lookup').addEventListener('click', async () => {
    const address = document.getElementById('address').value;
    const display = document.getElementById('zoning-display');
    
    if (!address) return alert("請輸入地址");

    display.innerText = "查詢中...";

    try {
        // 注意：這裡的 URL 需換成你 Render 後端的網址
        const response = await fetch('https://ohtp.onrender.com/get-zoning', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: address })
        });
        
        const data = await response.json();
        
        // 自動更新表單與顯示資訊
        display.innerHTML = `<i class="fas fa-info-circle"></i> 此地號屬 <strong>${data.zoning}</strong>，基準容積率為 <strong>${data.base_far}%</strong>`;
        
        // 若有縣市欄位則自動連動
        if(data.city_code) document.getElementById('city').value = data.city_code;
        
    } catch (error) {
        display.innerText = "查詢失敗，請手動輸入。";
        console.error("Lookup error:", error);
    }
});
// ===== GIS 土地分區查詢模組（獨立，不影響原功能） =====

document.addEventListener('DOMContentLoaded', function () {

    const btnLookup = document.getElementById('btn-lookup');

    if (!btnLookup) return;

    console.log("✅ GIS 模組載入");


    // 初始化地圖

    const mapDiv = document.getElementById('map');

    if (!mapDiv) {

        console.warn("⚠️ 沒有 map div");

        return;
    }


    const map = L.map('map').setView([25.0330, 121.5654], 13);


    L.tileLayer(

        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'

    ).addTo(map);



    // 政府土地分區圖層

    L.tileLayer.wms(

        "https://wms.nlsc.gov.tw/wms",

        {

            layers: "LUIMAP",

            format: "image/png",

            transparent: true

        }

    ).addTo(map);



    let marker = null;



    // 查詢事件
btnLookup.addEventListener('click', async function () {

const address = document.getElementById('address').value.trim();

const display = document.getElementById('zoning-display');

if (!address) {

alert("請輸入地址");

return;

}

display.innerText = "查詢中...";

try {


// ⭐ 加 language + 台灣限定 + jsonv2


const url =
"https://nominatim.openstreetmap.org/search?format=jsonv2"
+ "&accept-language=zh-TW"
+ "&countrycodes=tw"
+ "&limit=1"
+ "&q=" + encodeURIComponent(address);


console.log("查詢 URL:", url);


const response = await fetch(url, {

headers: {

'Accept': 'application/json'

}

});


const data = await response.json();

console.log("回傳資料:", data);


// 查不到


if (!data || data.length === 0) {

display.innerText = "查不到地址，請輸入完整地址";

return;

}


const lat = parseFloat(data[0].lat);

const lon = parseFloat(data[0].lon);


// 移動地圖


map.setView([lat, lon], 18);


// marker


if (marker) {

map.removeLayer(marker);

}


marker = L.marker([lat, lon]).addTo(map);


display.innerHTML =
"✅ 定位成功";


}

catch (error) {

display.innerText = "查詢失敗";

console.error(error);

}

});
    
