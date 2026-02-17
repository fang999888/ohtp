// 行動版選單切換
document.addEventListener('DOMContentLoaded', function() {
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
        quickForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 取得表單資料
            const houseAge = document.getElementById('house-age').value;
            const floors = document.getElementById('floors').value;
            const city = document.getElementById('city').value;
            
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
                // 簡單的判斷邏輯
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
            
            // 顯示結果（可以改用更漂亮的 modal）
            alert(`初步分析結果：\n\n建議優先考慮：${recommendedPath}\n\n原因：${reason}\n\n此為初步判斷，實際適用方案請諮詢當地政府窗口。`);
            
            // 未來可優化：跳轉到比較頁面並帶入參數
            // window.location.href = `pages/compare.html?age=${houseAge}&floors=${floors}&city=${city}`;
        });
        
        // 清除按鈕
        const resetBtn = quickForm.querySelector('button[type="reset"]');
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                quickForm.reset();
            });
        }
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
