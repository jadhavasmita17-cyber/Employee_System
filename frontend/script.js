const API = 'http://localhost:3000/employees';
let employees = [];
let page = 1;
const limit = 5;

$(document).ready(() => {
  loadEmployees();

  // Add employee
  $('#empForm').on('submit', e => {
    e.preventDefault();
    const emp = getFormData();
    axios.post(API, emp).then(() => {
      showAlert('Employee added successfully!', 'success');
      loadEmployees();
      $('#empForm')[0].reset();
    }).catch(err => showAlert(err.response.data.message, 'danger'));
  });

  // Update employee
  $('#updateBtn').click(() => {
    const id = $('#id').val();
    const emp = getFormData();
    axios.put(`${API}/${id}`, emp).then(() => {
      showAlert('Employee updated successfully!', 'info');
      loadEmployees();
      resetForm();
    }).catch(err => showAlert(err.response.data.message, 'danger'));
  });

  // Search and filters
  $('#search, #deptFilter, #minSalary, #maxSalary').on('input change', () => renderTable(filterEmployees()));

  // Pagination buttons
  $('#prev').click(() => { if (page > 1) { page--; renderTable(filterEmployees()); } });
  $('#next').click(() => {
    if (page * limit < filterEmployees().length) { page++; renderTable(filterEmployees()); }
  });

  $('#resetBtn').click(() => resetForm());
});

// --- Utility functions ---
function getFormData() {
  return {
    id: $('#id').val(),
    name: $('#name').val(),
    dept: $('#dept').val(),
    email: $('#email').val(),
    salary: $('#salary').val()
  };
}

function loadEmployees() {
  axios.get(API).then(res => {
    employees = res.data;
    renderTable(employees);
  });
}

function renderTable(data) {
  const start = (page - 1) * limit;
  const rows = data.slice(start, start + limit).map(e => `
    <tr>
      <td>${e.id}</td><td>${e.name}</td><td>${e.dept}</td>
      <td>${e.email}</td><td>${e.salary}</td>
      <td>
        <button class='btn btn-sm btn-info me-1' onclick='editEmp(${e.id})'>Edit</button>
        <button class='btn btn-sm btn-danger' onclick='delEmp(${e.id})'>Delete</button>
      </td>
    </tr>`).join('');
  $('#empTable tbody').html(rows);
  togglePaginationButtons(data);
}

function editEmp(id) {
  const emp = employees.find(e => e.id == id);
  $('#id').val(emp.id);
  $('#name').val(emp.name);
  $('#dept').val(emp.dept);
  $('#email').val(emp.email);
  $('#salary').val(emp.salary);
  $('#addBtn').hide();
  $('#updateBtn').show();
}

function resetForm() {
  $('#empForm')[0].reset();
  $('#addBtn').show();
  $('#updateBtn').hide();
}

function delEmp(id) {
  if (confirm('Delete this employee?'))
    axios.delete(`${API}/${id}`).then(() => {
      showAlert('Employee deleted!', 'danger');
      loadEmployees();
    });
}

// Filtering logic (search + dept + salary)
function filterEmployees() {
  const name = $('#search').val().toLowerCase();
  const dept = $('#deptFilter').val();
  const min = Number($('#minSalary').val()) || 0;
  const max = Number($('#maxSalary').val()) || Infinity;

  return employees.filter(e =>
    e.name.toLowerCase().includes(name) &&
    (!dept || e.dept === dept) &&
    e.salary >= min && e.salary <= max
  );
}

function togglePaginationButtons(data) {
  $('#prev').prop('disabled', page === 1);
  $('#next').prop('disabled', page * limit >= data.length);
}

// Bootstrap alert
function showAlert(message, type) {
  $('#alertBox').html(`
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `);
  setTimeout(() => $('.alert').alert('close'), 3000);
}