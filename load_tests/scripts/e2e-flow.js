import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = 'http://localhost:3000';
const AUTH_URL = `${BASE_URL}/authservice`;

export const options = {
    vus: 1, // Start with 1 to verify logic
    duration: '10s'
};

export function setup() {
    // Use Date.now() for uniqueness instead of __ITER
    const timestamp = Date.now();
    const uniqueEmail = `test_${timestamp}@example.com`;

    // 1. SIGN UP (AuthService uses x-www-form-urlencoded)
    const signupRes = http.post(`${AUTH_URL}/signup`, {
        email: uniqueEmail,
        password: 'Password123!',
        role: 'EMPLOYEE'
    }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    console.log(`Signup status: ${signupRes.status}`);

    // 2. LOG IN
    const loginRes = http.post(`${AUTH_URL}/login`, {
        email: uniqueEmail,
        password: 'Password123!'
    }, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    console.log(`Login status: ${loginRes.status}`);

    const token = loginRes.json('token');
    const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' // Necessary for JSON payloads
    };

    // 3. REGISTER EMPLOYEE
    const regPayload = {
        employee: {
            first_name: `Test${timestamp}`,
            last_name: "User",
            phone: "9876543210",
            date_of_birth: "1995-01-01",
            gender: "Male"
        },
        employeeDetails: {
            address: "123 Main St",
            city: "Bhubaneswar",
            state: "Odisha",
            country: "India",
            pincode: "751001",
            emergency_contact: "9876543210",
            marital_status: "Single",
            aadhar_no: "123456789012",
            father_name: "John Doe",
            mother_name: "Jane Doe"
        },
        jobDetails: {
            designation: "Software Engineer",
            department: "IT",
            employee_type: "Full-Time",
            salary: 50000,
            joining_date: "2026-05-21",
            experience_duration: "2 Years",
            skills: "Java, Angular",
            prev_org: "Tech Corp"
        }
    };

    const regPostRes = http.post(`${BASE_URL}/employeeservice`, JSON.stringify(regPayload), { headers });
    console.log(`Registration status: ${regPostRes.status}, body: ${regPostRes.body}`);
    check(regPostRes, { 'registration success': (r) => r.status === 200 || r.status === 201 });

    // 4. GET EMPLOYEE ID
    const isRegRes = http.get(`${BASE_URL}/employeeservice/isRegistered`, { headers });
    console.log(`isRegistered status: ${isRegRes.status}, body: ${isRegRes.body}`);
    const employeeId = isRegRes.json('data.id');

    console.log(`Setup complete: User ${uniqueEmail} created with EmpID: ${employeeId}`);

    return { employeeId, token };
}

export default function (data) {
    const { employeeId, token } = data;
    const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
 
    const url = `${BASE_URL}/employeeservice/attendance/${employeeId}?limit=30&offset=0`;
    const res = http.get(url, { headers });
 
    check(res, {
      'attendance status is 200': (r) => r.status === 200,
    });
}