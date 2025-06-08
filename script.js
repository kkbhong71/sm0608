document.addEventListener('DOMContentLoaded', () => {
    const mealDateInput = document.getElementById('mealDate');
    const currentDateElement = document.getElementById('currentDate');
    const mealMenuElement = document.getElementById('mealMenu');

    // Set default date to today
    const today = new Date();
    const formattedDate = formatDate(today);
    mealDateInput.value = formattedDate;
    currentDateElement.textContent = formatDisplayDate(today);

    // Show welcome message
    Swal.fire({
        title: '환영합니다!',
        text: '오늘의 급식 정보를 확인해보세요.',
        icon: 'info',
        confirmButtonText: '확인',
        confirmButtonColor: '#6C63FF'
    });

    // Fetch initial meal data
    fetchMealData(formattedDate);

    // Add event listener for date changes
    mealDateInput.addEventListener('change', (e) => {
        const selectedDate = e.target.value;
        currentDateElement.textContent = formatDisplayDate(new Date(selectedDate));
        fetchMealData(selectedDate);
    });
});

async function fetchMealData(date) {
    const mealMenuElement = document.getElementById('mealMenu');
    
    // Show loading state
    mealMenuElement.innerHTML = `
        <div class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span class="ml-2">급식 정보를 불러오는 중...</span>
        </div>
    `;

    try {
        // Format date for API (YYYYMMDD)
        const apiDate = date.replace(/-/g, '');
        
        // API URL with the provided endpoint
        const apiUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?ATPT_OFCDC_SC_CODE=J10&SD_SCHUL_CODE=7631011&MLSV_YMD=${apiDate}`;

        const response = await fetch(apiUrl);
        const text = await response.text();
        
        // Parse XML response
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");

        // Check for error response
        const result = xmlDoc.getElementsByTagName("RESULT")[0];
        if (result) {
            const code = result.getElementsByTagName("CODE")[0]?.textContent;
            if (code === "INFO-200") {
                showNoMealInfo();
                return;
            }
        }

        // Get meal information
        const row = xmlDoc.getElementsByTagName("row")[0];
        if (row) {
            const menu = row.getElementsByTagName("DDISH_NM")[0]?.textContent;
            if (menu) {
                const formattedMenu = menu.replace(/<br\/>/g, '\n');
                mealMenuElement.innerHTML = formattedMenu.split('\n').map(item => 
                    `<div class="py-1">${item}</div>`
                ).join('');
            } else {
                showError('급식 정보를 불러올 수 없습니다.');
            }
        } else {
            showError('급식 정보를 불러올 수 없습니다.');
        }
    } catch (error) {
        console.error('Error fetching meal data:', error);
        showError('급식 정보를 불러오는 중 오류가 발생했습니다.');
    }
}

function showNoMealInfo() {
    const mealMenuElement = document.getElementById('mealMenu');
    mealMenuElement.innerHTML = `
        <div class="text-center text-gray-500 py-4">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p class="mt-2">해당 날짜의 급식 정보가 없습니다.</p>
        </div>
    `;
}

function showError(message) {
    const mealMenuElement = document.getElementById('mealMenu');
    mealMenuElement.innerHTML = `
        <div class="text-center text-red-500 py-4">
            <svg class="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="mt-2">${message}</p>
        </div>
    `;

    // Show error notification
    Swal.fire({
        title: '오류 발생',
        text: message,
        icon: 'error',
        confirmButtonText: '확인',
        confirmButtonColor: '#6C63FF'
    });
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
}
