import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
let foodItemArray = []; // foodItemArray는 칼로리 범위에 해당하는 음식 배열
let randomFoodSet = new Set();
 

// 정적 파일 제공
app.use(express.static(join(__dirname, 'public')));
app.use(cors());

// 파싱된 JSON 형식의 요청을 처리하기 위한 미들웨어
app.use(express.json());

// 서버에서 캐싱 기능 제거
app.set('etag', false);

// 강제 캐시 무효화 헤더 추가
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
// 데이터 엔드포인트 처리 (POST 요청)
app.post('/data', (req, res) => { 
  /*try {
    // 요청 바디에서 데이터 추출
    const { min_kcal, max_kcal } = req.body; 
    console.log("server.js에서 ", min_kcal, max_kcal);

    if (min_kcal !== undefined && max_kcal !== undefined) { 
      const foodItem = fetchApi(min_kcal, max_kcal);
      foodItem.then((foodItem)=>res.status(200).json(foodItem));
      console.log(foodItem);
    } else {
      res.status(400).json({ message: '잘못된 요청입니다.' });
    }
  } catch (error) {
    console.error("에러 발생:", error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }*/
  // Cache-Control 헤더 확인
  const cacheControl = req.headers['cache-control'];

  // 요청이 새로운 것인지 확인
  const isNewRequest = cacheControl === 'no-cache';

  // 새로운 요청일 경우에만 처리
  if (isNewRequest) {
    const { min_kcal, max_kcal } = req.body; 
    console.log("server.js에서 ", min_kcal, max_kcal);

    if (min_kcal !== undefined && max_kcal !== undefined) { 
      const foodItem = fetchApi(min_kcal, max_kcal);
      foodItem.then((foodItem)=>res.status(200).json(foodItem));
      console.log(foodItem);
    }
  } else {
    // 캐싱된 응답 반환
    res.sendStatus(304);
  }
});


// 포트 설정
const PORT = process.env.PORT || 3000;

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  randomFoodSet.clear();
});

// 외부 API에서 백엔드로 데이터 가져오기 (한국어 음식 ver)
async function fetchApi(min_kcal, max_kcal) {
  try {
      const response = await fetch("http://211.237.50.150:7080/openapi/1b72a1429a655049f0de0e2dfeae2b453092b2b28deca343873bb1d4864c2847/json/Grid_20150827000000000226_1/1/537");         
      const jsonData = await response.json();
      console.log("api를 정상적으로 불러왔습니다");  // 키:row -> 배열 - ROW_NUM(음식번호), RECIPE_NM_KO(음식이름), NATION_NM(나라), CALORIE(칼로리) 

      let newFoodItemArray = await processData(jsonData, min_kcal, max_kcal);
      
      console.log("newFoodItemArray는", newFoodItemArray);
      return newFoodItemArray;
      
  } catch (error) {
      console.error(error);
  }
}


function processData(jsonData, min_kcal, max_kcal) {  //비동기 함수 - 음식 선별 메서드
  return new Promise((resolve, reject) => {
    foodItemArray = []; 
    const idxArray = [];
    for (let i = 0; i < jsonData.Grid_20150827000000000226_1.row.length; i++) {
      const calorieString = jsonData.Grid_20150827000000000226_1.row[i].CALORIE;
      if (calorieString !== null) {
        const calorieMatch = calorieString.match(/(\d+)/);
        if (calorieMatch !== null) {
          const calorie = parseInt(calorieMatch[0]);
          //console.log("calorie는", calorie); 
          if (calorie >= parseInt(min_kcal) && calorie <= parseInt(max_kcal)) {
            idxArray.push(i); // i는 jsonData의 인덱스 
            console.log("범위 내의 칼로리는", calorie)
          }
          
        }
      }
    }
    resolve(idxArray);
  }).then((idxArray)=>{
      for (let i=0; i<idxArray.length; i++) {
        foodItemArray.push(jsonData.Grid_20150827000000000226_1.row[idxArray[i]]);
      }
      
      console.log("foodItemArray는", foodItemArray);
      return foodItemArray;
    
  }).then((foodItemArray)=>getRandom10Data(foodItemArray));
}


function getRandom10Data(foodItemArray) {
  randomFoodSet.clear(); // randomFoodSet 초기화
  
  while (randomFoodSet.size < 10) {
    const randomIndex = Math.floor(Math.random() * foodItemArray.length);
    randomFoodSet.add(foodItemArray[randomIndex]);
  }
  const finalFoodArray = Array.from(randomFoodSet); // 최종 선정된 음식
  return finalFoodArray;
}
/*for (let i=0; i<jsonData.Grid_20150827000000000226_1.row.length; i++) {
      const calorieString = jsonData.Grid_20150827000000000226_1.row[i].CALORIE;
      if (calorieString !== null) {
        const calorieMatch = calorieString.match(/\d+/);
        if (calorieMatch !== null) {
          const calorie = parseInt(calorieMatch[0]);
          if (!isNaN(calorie) && calorie >= min_kcal && calorie <= max_kcal) {
            foodItemArray.push(jsonData.Grid_20150827000000000226_1.row[i]);
          }
        }
      }
    } */
/*
// 외부 API에서 백엔드로 데이터 가져오기 (영어 음식 ver)
async function fetchApi(min_kcal, max_kcal) {
    try {
        const response = await fetch(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByNutrients?minCalories=${min_kcal}&maxCalories=${max_kcal}&random=true`, 
        {
            method: 'GET',
            headers: {
            'X-RapidAPI-Key': 'e67a3629e7msh3e154081f0cee7cp1f54cbjsn9adf013e0f8e',
            'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
            }
        });
            
        const jsonData = await response.json();
        console.log(jsonData);  // 음식 배열 데이터. id, title, image, imageType, calories, protein, fat, carbs 

        return jsonData;
    } catch (error) {
        console.error(error);
    }
}
*/

