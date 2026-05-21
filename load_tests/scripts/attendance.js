import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = __ENV.API_URL;

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const empId = '123';
  const limit = 30;
  const offset = 0;
  
  const url = `${BASE_URL}/employeeservice/attendance/${empId}?limit=${limit}&offset=${offset}`;
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.get(url, params);

  check(res, {
    'get attendance status is 200': (r) => r.status === 200,
  });
}