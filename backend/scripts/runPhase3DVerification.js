const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

const { connectDatabase, disconnectDatabase } = require('../config/database');
const Inquiry = require('../models/Inquiry');
const Admin = require('../models/Admin');
const { generateToken } = require('../utils/jwt');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('====================================================');
  console.log('STARTING PHASE 3D VERIFICATION & END-TO-END TEST SUITE');
  console.log('====================================================\n');

  let passedAll = true;
  let testInquiryId = null;

  try {
    await connectDatabase();
    console.log('✓ Connected to MongoDB Atlas successfully.');

    // Find or create an admin for testing admin endpoints
    let admin = await Admin.findOne({ isActive: true });
    if (!admin) {
      admin = await Admin.create({
        name: 'System Verifier',
        email: 'verifier@haxudio.test',
        password: 'Password123!',
        role: 'superadmin',
        isActive: true,
      });
      console.log('✓ Created temporary verification admin account.');
    } else {
      console.log('✓ Found active admin account for JWT verification.');
    }

    const validToken = generateToken({
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    });

    // ----------------------------------------------------
    // TEST 1: Public Contact Form Submission (without login)
    // ----------------------------------------------------
    console.log('\n--- Test 1: Public Contact Form Submission ---');
    const submitPayload = {
      name: 'Test Haxudio Client',
      email: 'test@example.com',
      service: 'Web Development',
      message: 'Testing Haxudio inquiry management.',
    };

    const submitRes = await fetch(`${BASE_URL}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitPayload),
    });

    const submitData = await submitRes.json();
    console.log('Status code:', submitRes.status);
    console.log('Response body:', submitData);

    if (submitRes.status === 201 && submitData.success && submitData.inquiryId) {
      testInquiryId = submitData.inquiryId;
      console.log('✓ PASS: POST /api/inquiries successfully created inquiry with ID:', testInquiryId);
    } else {
      console.error('✗ FAIL: POST /api/inquiries failed');
      passedAll = false;
    }

    // ----------------------------------------------------
    // TEST 2: Verify Public CANNOT GET Inquiries
    // ----------------------------------------------------
    console.log('\n--- Test 2: Public Privacy Protection (No Public GET) ---');
    const publicGetRes = await fetch(`${BASE_URL}/api/inquiries`);
    console.log('Public GET /api/inquiries status:', publicGetRes.status);
    if (publicGetRes.status === 404 || publicGetRes.status === 405) {
      console.log('✓ PASS: Public users cannot retrieve inquiries (HTTP 404/405).');
    } else {
      console.error('✗ FAIL: Public GET /api/inquiries exposed route!');
      passedAll = false;
    }

    // ----------------------------------------------------
    // TEST 3: Verify MongoDB Storage
    // ----------------------------------------------------
    console.log('\n--- Test 3: Verify MongoDB Atlas Storage ---');
    const inqDoc = await Inquiry.findById(testInquiryId);
    if (inqDoc && inqDoc.name === 'Test Haxudio Client' && inqDoc.status === 'new' && inqDoc.isRead === false) {
      console.log('✓ PASS: Inquiry document verified in MongoDB Atlas:');
      console.log('   - Name:', inqDoc.name);
      console.log('   - Email:', inqDoc.email);
      console.log('   - Service:', inqDoc.service);
      console.log('   - Status:', inqDoc.status);
      console.log('   - isRead:', inqDoc.isRead);
    } else {
      console.error('✗ FAIL: Document not found or attributes mismatch in MongoDB.');
      passedAll = false;
    }

    // ----------------------------------------------------
    // TEST 4: Security - Unauthenticated Admin Route Rejected (401)
    // ----------------------------------------------------
    console.log('\n--- Test 4: Protected Admin API Security (Unauthenticated 401) ---');
    const unauthRes = await fetch(`${BASE_URL}/api/admin/inquiries`);
    console.log('Unauthenticated GET /api/admin/inquiries status:', unauthRes.status);
    if (unauthRes.status === 401) {
      console.log('✓ PASS: Unauthenticated access blocked with HTTP 401.');
    } else {
      console.error('✗ FAIL: Protected route allowed unauthenticated request.');
      passedAll = false;
    }

    // ----------------------------------------------------
    // TEST 5: Authenticated Admin Inquiries List
    // ----------------------------------------------------
    console.log('\n--- Test 5: Authenticated GET /api/admin/inquiries ---');
    const authListRes = await fetch(`${BASE_URL}/api/admin/inquiries`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const authListData = await authListRes.json();
    console.log('Auth GET status:', authListRes.status);
    console.log('Total inquiries returned:', authListData.total);

    const foundTestLead = (authListData.data || []).find((i) => i._id.toString() === testInquiryId);
    if (authListRes.status === 200 && foundTestLead) {
      console.log('✓ PASS: Test inquiry "Test Haxudio Client" appears in admin listing.');
    } else {
      console.error('✗ FAIL: Test inquiry not found in admin response.');
      passedAll = false;
    }

    // ----------------------------------------------------
    // TEST 6: Mark Inquiry As Read
    // ----------------------------------------------------
    console.log('\n--- Test 6: Mark Inquiry as Read ---');
    const readRes = await fetch(`${BASE_URL}/api/admin/inquiries/${testInquiryId}/read`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({ isRead: true }),
    });
    const readData = await readRes.json();
    console.log('Read patch status:', readRes.status);
    console.log('Updated isRead state:', readData.data?.isRead);

    const checkReadDoc = await Inquiry.findById(testInquiryId);
    if (readRes.status === 200 && checkReadDoc.isRead === true) {
      console.log('✓ PASS: Inquiry marked as read in MongoDB Atlas (isRead = true).');
    } else {
      console.error('✗ FAIL: isRead update failed');
      passedAll = false;
    }

    // ----------------------------------------------------
    // TEST 7: Change Lead Status (new -> contacted)
    // ----------------------------------------------------
    console.log('\n--- Test 7: Change Status (new -> contacted) ---');
    const statusRes = await fetch(`${BASE_URL}/api/admin/inquiries/${testInquiryId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({ status: 'contacted' }),
    });
    const statusData = await statusRes.json();
    console.log('Status patch status:', statusRes.status);
    console.log('Updated status:', statusData.data?.status);

    const checkStatusDoc = await Inquiry.findById(testInquiryId);
    if (statusRes.status === 200 && checkStatusDoc.status === 'contacted') {
      console.log('✓ PASS: Inquiry status updated in MongoDB Atlas (status = "contacted").');
    } else {
      console.error('✗ FAIL: Status update failed');
      passedAll = false;
    }

    // ----------------------------------------------------
    // TEST 8: Add Private Admin Notes
    // ----------------------------------------------------
    console.log('\n--- Test 8: Add Private Admin Notes ---');
    const noteText = 'Test inquiry successfully reviewed.';
    const notesRes = await fetch(`${BASE_URL}/api/admin/inquiries/${testInquiryId}/notes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${validToken}`,
      },
      body: JSON.stringify({ adminNotes: noteText }),
    });
    const notesData = await notesRes.json();
    console.log('Notes patch status:', notesRes.status);

    const checkNotesDoc = await Inquiry.findById(testInquiryId);
    if (notesRes.status === 200 && checkNotesDoc.adminNotes === noteText) {
      console.log('✓ PASS: Admin notes saved in MongoDB Atlas ("' + noteText + '").');
    } else {
      console.error('✗ FAIL: Admin notes save failed');
      passedAll = false;
    }

    // ----------------------------------------------------
    // TEST 9: Validation Checks (Empty fields, invalid email)
    // ----------------------------------------------------
    console.log('\n--- Test 9: Input Validation Tests ---');
    // Missing required fields
    const emptyRes = await fetch(`${BASE_URL}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: '', message: '' }),
    });
    console.log('Empty submission status:', emptyRes.status);
    if (emptyRes.status === 400) {
      console.log('✓ PASS: Empty required fields correctly rejected (HTTP 400).');
    } else {
      console.error('✗ FAIL: Empty fields was not rejected');
      passedAll = false;
    }

    // Invalid email
    const badEmailRes = await fetch(`${BASE_URL}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bad Email User',
        email: 'invalid-email-string',
        message: 'Hello testing validation.',
      }),
    });
    console.log('Bad email submission status:', badEmailRes.status);
    if (badEmailRes.status === 400) {
      console.log('✓ PASS: Invalid email correctly rejected (HTTP 400).');
    } else {
      console.error('✗ FAIL: Invalid email was not rejected');
      passedAll = false;
    }

    // ----------------------------------------------------
    // TEST 10: Delete Inquiry and Confirm Removal
    // ----------------------------------------------------
    console.log('\n--- Test 10: Delete Inquiry from MongoDB Atlas ---');
    const delRes = await fetch(`${BASE_URL}/api/admin/inquiries/${testInquiryId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const delData = await delRes.json();
    console.log('Delete status:', delRes.status);
    console.log('Delete response:', delData);

    const checkDelDoc = await Inquiry.findById(testInquiryId);
    if (delRes.status === 200 && !checkDelDoc) {
      console.log('✓ PASS: Test inquiry deleted and completely removed from MongoDB Atlas.');
    } else {
      console.error('✗ FAIL: Inquiry still exists after DELETE');
      passedAll = false;
    }

    // ----------------------------------------------------
    // TEST 11: Regression Check for All Routes
    // ----------------------------------------------------
    console.log('\n--- Test 11: System Regression Checks ---');
    const routesToCheck = [
      { path: '/api/health', expectedStatus: 200 },
      { path: '/api/services', expectedStatus: 200 },
      { path: '/api/projects', expectedStatus: 200 },
      { path: '/api/testimonials', expectedStatus: 200 },
      { path: '/api/team', expectedStatus: 200 },
      { path: '/', expectedStatus: 200 },
      { path: '/contact', expectedStatus: 200 },
      { path: '/about', expectedStatus: 200 },
      { path: '/services', expectedStatus: 200 },
      { path: '/portfolio', expectedStatus: 200 },
    ];

    for (const r of routesToCheck) {
      const res = await fetch(`${BASE_URL}${r.path}`);
      if (res.status === r.expectedStatus) {
        console.log(`✓ PASS: ${r.path} returned status ${res.status}`);
      } else {
        console.error(`✗ FAIL: ${r.path} returned status ${res.status} (expected ${r.expectedStatus})`);
        passedAll = false;
      }
    }

    console.log('\n====================================================');
    if (passedAll) {
      console.log('ALL PHASE 3D VERIFICATION TESTS COMPLETED SUCCESSFULLY (100% PASS)');
    } else {
      console.error('SOME PHASE 3D TESTS ENCOUNTERED FAILURES');
    }
    console.log('====================================================');
  } catch (err) {
    console.error('Unexpected error during verification:', err);
    passedAll = false;
  } finally {
    await disconnectDatabase();
    process.exit(passedAll ? 0 : 1);
  }
}

runTests();
