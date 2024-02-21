let gender = '';
let activity = '';
let mealTime = '';
let dataList = [];



function setGender(selectedGender) {
  gender = selectedGender;
  document.getElementById('maleBtn').classList.remove('selected');
  document.getElementById('femaleBtn').classList.remove('selected');
  if (selectedGender === '남자') {
    document.getElementById('maleBtn').classList.add('selected');
  } else if (selectedGender === '여자') {
    document.getElementById('femaleBtn').classList.add('selected');
  }
}

function setActivity(selectedActivity) {
  activity = selectedActivity;
  document.getElementById('activeBtn').classList.remove('selected');
  document.getElementById('sedentaryBtn').classList.remove('selected');
  if (selectedActivity === '동적') {
    document.getElementById('activeBtn').classList.add('selected');
  } else if (selectedActivity === '정적') {
    document.getElementById('sedentaryBtn').classList.add('selected');
  }
}

function setMealTime(selectedMealTime) {
  mealTime = selectedMealTime;
  document.getElementById('breakfastBtn').classList.remove('selected');
  document.getElementById('lunchBtn').classList.remove('selected');
  document.getElementById('dinnerBtn').classList.remove('selected');
  if (selectedMealTime === '아침') {
    document.getElementById('breakfastBtn').classList.add('selected');
  } else if (selectedMealTime === '점심') {
    document.getElementById('lunchBtn').classList.add('selected');
  } else if (selectedMealTime === '저녁') {
    document.getElementById('dinnerBtn').classList.add('selected');
  }
}

function saveData() {
  const age = document.getElementById('ageInput').value;
  const height = document.getElementById('heightInput').value;
  const weight = document.getElementById('weightInput').value;

  dataList = [gender, activity, mealTime, age, height, weight];
  console.log(dataList);

  if (gender === '' || activity === '' || mealTime === '' || age === '' || height === '' || weight === '') {
    Swal.fire({
      icon: 'warning',
      title: '모든 데이터를 입력해주세요',
      showConfirmButton: false,
      timer: 700
    });
  } else {
    let kcal = calculateKcal(dataList);
    const min_kcal = Math.ceil(kcal * 0.8);
    const max_kcal = Math.ceil(kcal * 1.2);

    console.log("최소, 최대 칼로리: ", min_kcal, max_kcal);

    const caloriesData = { min_kcal: min_kcal, max_kcal: max_kcal };  // 결과보기 두번 째 눌렀을 때도 정상적으로 전달됨
    console.log(caloriesData);
    postJSON(caloriesData);   // 최소 최대 칼로리 데이터 정보 백엔드로 보내기
  }
  
}


// 백엔드로 POST 방식으로 데이터 보내기 & modal창 띄우기 
async function postJSON(data) {
  try {
    const response = await fetch("http://localhost:3000/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache" // 캐시 제어
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('서버 응답이 실패했습니다.');
    }

    const result = await response.json();
    console.log("성공:", result); // 결과보기 두번 째 클릭 때도 똑같은 데이터가 출력됨  
    modalDisplay(result);
    
  } catch (error) {
    console.error("실패:", error);
  }
}


const myModal = document.getElementById('myModal');
const foodImage = document.getElementById('foodImage');
const foodTitle = document.getElementById('foodTitle');
const calories = document.getElementById('calories');
/*const protein = document.getElementById('protein');
const fat = document.getElementById('fat');
const carbs = document.getElementById('carbs');*/
const anotherFoodBtn = document.getElementById('anotherFoodBtn');
const detailInfoBtn = document.getElementById('detailInfoBtn');



// 구글에서 이미지 가져오기
function getImagefromGoogle(searchTerm) { 
  //searchTerm = "검색할 키워드";

  const url = `https://www.googleapis.com/customsearch/v1?key=AIzaSyCRRbA6n4ZSVsQxHxfO2Aa-7kGGzVF3GM4&cx=3682eb967076e48be&q=${encodeURIComponent(searchTerm)}&searchType=image`;
  
  fetch(url)
  .then(response => response.json())
  .then(data => {
    const imageUrl = data.items[0].link; // 첫 번째 이미지의 링크 가져오기
    foodImage.src = imageUrl; // 이미지 표시
    console.log("이미지를 정상적으로 가져옴")
  })
  .catch(error => console.error("이미지를 가져오는 중 오류가 발생했습니다.", error));
}


function modalDisplay(foodData) {
  myModal.style.display = 'block';

  getImagefromGoogle(foodData[0].RECIPE_NM_KO);
  foodTitle.textContent = foodData[0].RECIPE_NM_KO;
  calories.textContent = foodData[0].CALORIE;

  anotherFoodRec(foodData);
  
  modalClose();
}


let count = 0;

function anotherFoodRec(foodData) {
  anotherFoodBtn.addEventListener('click', function () {
    if (count < 9) {
      count++;
      
      getImagefromGoogle(foodData[count].RECIPE_NM_KO);
      foodTitle.textContent = foodData[count].RECIPE_NM_KO;
      calories.textContent = `열량: ${foodData[count].CALORIE}kcal`;
      
      detailInfo(foodTitle.textContent);
    } else {
      Swal.fire({
        icon: 'warning',
        title: '추천 가능한 음식이 없습니다',
        showConfirmButton: true,
      });
    }
  });
}
/*
function modalDisplay(foodData) {
  myModal.style.display = 'block';

  foodImage.src = foodData[0].image; // 이미지 주소
  foodTitle.textContent = foodData[0].title; // 음식 이름
  calories.textContent = `열량: ${foodData[0].calories}kcal`;
  protein.textContent = `단백질: ${foodData[0].protein}`;
  fat.textContent = `지방: ${foodData[0].fat}`;
  carbs.textContent = `탄수화물: ${foodData[0].carbs}`;

  anotherFoodRec(foodData);
  detailInfo(foodTitle.textContent);
  modalClose();
}
*/

/*let count = 0;

function anotherFoodRec(foodData) {
  anotherFoodBtn.addEventListener('click', function () {
    if (count < 9) {
      count++;
      
      foodImage.src = foodData[count].image;
      foodTitle.textContent = foodData[count].title;
      calories.textContent = `열량: ${foodData[count].calories}kcal`;
      protein.textContent = `단백질: ${foodData[count].protein}`;
      fat.textContent = `지방: ${foodData[count].fat}`;
      carbs.textContent = `탄수화물: ${foodData[count].carbs}`;
      
    } else {
      Swal.fire({
        icon: 'warning',
        title: '추천 가능한 음식이 없습니다',
        showConfirmButton: true,
      });
    }
  });
}
*/

function detailInfo(food) {
  detailInfoBtn.addEventListener('click', () => {
    window.location.href = `https://map.naver.com/p/search/${food}`;
  });
}

function modalClose() {
  const modalClose = document.querySelector(".close");
  modalClose.addEventListener('click', () => {
    myModal.style.display = 'none';
  });
}


// 한끼당 적정 칼로리 계산하기 
function calculateKcal(dataList) {
  /*const gender = dataList[0];
  const activity = dataList[1];
  const mealTime = dataList[2];
  const age = dataList[3];
  const height = dataList[4];
  const weight = dataList[5];*/
  let bmr = '';
  let total_kcal = '';
  let per_kcal = '';

  if (dataList[0] == '남자') {
    bmr = 88.362 + (13.397 * dataList[5]) + (4.799 * dataList[4]) - (5.677 * dataList[3]);
  } else if (dataList[0] == '여자') {
    bmr = 447.593 + (9.247 * dataList[5]) + (3.098 * dataList[4]) - (4.330 * dataList[3]);
  }

  if (dataList[1] == '동적') {
    total_kcal = bmr * 1.5;
  }
  else if (dataList[1] == '정적') {
    total_kcal = bmr * 1.2;
  }

  if (dataList[2] == '아침') {
    per_kcal = total_kcal * 0.25;
  } else if (dataList[2] == '점심') {
    per_kcal = total_kcal * 0.35;
  } else if (dataList[2] == '저녁') {
    per_kcal = total_kcal * 0.35;
  }

  return per_kcal;
}