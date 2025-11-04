// Charts.js - Gráficos Interactivos para el Dashboard
class DashboardCharts {
  constructor() {
    this.charts = {};
    this.colors = {
      primary: '#667eea',
      secondary: '#764ba2',
      success: '#38a169',
      warning: '#d69e2e',
      danger: '#e53e3e',
      info: '#3182ce',
      light: '#f7fafc',
      dark: '#2d3748'
    };
    
    this.gradients = {};
    this.initializeCharts();
  }

  // Crear gradientes para los gráficos
  createGradients(ctx) {
    // Gradiente principal
    const primaryGradient = ctx.createLinearGradient(0, 0, 0, 300);
    primaryGradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
    primaryGradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)');
    
    // Gradiente de éxito
    const successGradient = ctx.createLinearGradient(0, 0, 0, 300);
    successGradient.addColorStop(0, 'rgba(56, 161, 105, 0.8)');
    successGradient.addColorStop(1, 'rgba(56, 161, 105, 0.1)');
    
    // Gradiente de advertencia
    const warningGradient = ctx.createLinearGradient(0, 0, 0, 300);
    warningGradient.addColorStop(0, 'rgba(214, 158, 46, 0.8)');
    warningGradient.addColorStop(1, 'rgba(214, 158, 46, 0.1)');
    
    return {
      primary: primaryGradient,
      success: successGradient,
      warning: warningGradient
    };
  }

  // Inicializar todos los gráficos
  initializeCharts() {
    this.initMainActivityChart();
    this.initCareersDistributionChart();
    this.initMiniCharts();
  }

  // Gráfico principal de actividad del sistema
  initMainActivityChart() {
    const ctx = document.getElementById('main-activity-chart');
    if (!ctx) return;

    const gradients = this.createGradients(ctx.getContext('2d'));

    // Datos de ejemplo para las últimas 24 horas
    const labels = [];
    const studentsData = [];
    const visitorsData = [];
    const adminsData = [];

    // Generar datos de ejemplo
    for (let i = 23; i >= 0; i--) {
      const hour = new Date();
      hour.setHours(hour.getHours() - i);
      labels.push(hour.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
      
      studentsData.push(Math.floor(Math.random() * 50) + 10);
      visitorsData.push(Math.floor(Math.random() * 20) + 5);
      adminsData.push(Math.floor(Math.random() * 5) + 1);
    }

    this.charts.mainActivity = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Estudiantes',
            data: studentsData,
            borderColor: this.colors.primary,
            backgroundColor: gradients.primary,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: this.colors.primary,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Visitantes',
            data: visitorsData,
            borderColor: this.colors.success,
            backgroundColor: gradients.success,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: this.colors.success,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: 'Administradores',
            data: adminsData,
            borderColor: this.colors.warning,
            backgroundColor: gradients.warning,
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: this.colors.warning,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                weight: '600'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#2d3748',
            bodyColor: '#4a5568',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            padding: 12
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#718096',
              font: {
                size: 11
              }
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(226, 232, 240, 0.5)',
              drawBorder: false
            },
            ticks: {
              color: '#718096',
              font: {
                size: 11
              },
              padding: 10
            }
          }
        },
        elements: {
          point: {
            hoverBorderWidth: 3
          }
        }
      }
    });
  }

  // Gráfico de distribución por carreras
  initCareersDistributionChart() {
    const ctx = document.getElementById('careers-distribution-chart');
    if (!ctx) return;

    const careers = [
      'Ingeniería de Sistemas',
      'Medicina',
      'Derecho',
      'Administración',
      'Psicología',
      'Arquitectura'
    ];

    const data = [
      { career: 'Ingeniería de Sistemas', students: 450, color: '#667eea' },
      { career: 'Medicina', students: 380, color: '#38a169' },
      { career: 'Derecho', students: 320, color: '#d69e2e' },
      { career: 'Administración', students: 290, color: '#e53e3e' },
      { career: 'Psicología', students: 250, color: '#3182ce' },
      { career: 'Arquitectura', students: 180, color: '#764ba2' }
    ];

    this.charts.careersDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(item => item.career),
        datasets: [{
          data: data.map(item => item.students),
          backgroundColor: data.map(item => item.color),
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverBorderWidth: 4,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15,
              font: {
                size: 11,
                weight: '500'
              },
              generateLabels: function(chart) {
                const original = Chart.defaults.plugins.legend.labels.generateLabels;
                const labels = original.call(this, chart);
                
                labels.forEach((label, index) => {
                  label.text = `${label.text}: ${data[index].students}`;
                });
                
                return labels;
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#2d3748',
            bodyColor: '#4a5568',
            borderColor: '#e2e8f0',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} estudiantes (${percentage}%)`;
              }
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000
        }
      }
    });
  }

  // Mini gráficos para las KPI cards
  initMiniCharts() {
    this.initStudentsMiniChart();
    this.initVisitorsMiniChart();
    this.initSessionsMiniChart();
    this.initAdminsMiniChart();
  }

  initStudentsMiniChart() {
    const ctx = document.getElementById('students-mini-chart');
    if (!ctx) return;

    const data = Array.from({ length: 7 }, () => Math.floor(Math.random() * 100) + 50);

    this.charts.studentsMini = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
        datasets: [{
          data: data,
          borderColor: this.colors.primary,
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        },
        elements: {
          point: { radius: 0 }
        }
      }
    });
  }

  initVisitorsMiniChart() {
    const ctx = document.getElementById('visitors-mini-chart');
    if (!ctx) return;

    const data = Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 20);

    this.charts.visitorsMini = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
        datasets: [{
          data: data,
          backgroundColor: 'rgba(56, 161, 105, 0.8)',
          borderRadius: 2,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }

  initSessionsMiniChart() {
    const ctx = document.getElementById('sessions-mini-chart');
    if (!ctx) return;

    const data = Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 5);

    this.charts.sessionsMini = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array.from({ length: 12 }, (_, i) => i),
        datasets: [{
          data: data,
          borderColor: this.colors.warning,
          backgroundColor: 'rgba(214, 158, 46, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }

  initAdminsMiniChart() {
    const ctx = document.getElementById('admins-mini-chart');
    if (!ctx) return;

    this.charts.adminsMini = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Activos', 'Inactivos'],
        datasets: [{
          data: [8, 2],
          backgroundColor: [this.colors.info, '#e2e8f0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
  }

  // Actualizar datos de los gráficos
  updateMainActivityChart(period = '24h') {
    if (!this.charts.mainActivity) return;

    let labels = [];
    let studentsData = [];
    let visitorsData = [];
    let adminsData = [];

    switch (period) {
      case '24h':
        for (let i = 23; i >= 0; i--) {
          const hour = new Date();
          hour.setHours(hour.getHours() - i);
          labels.push(hour.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
          studentsData.push(Math.floor(Math.random() * 50) + 10);
          visitorsData.push(Math.floor(Math.random() * 20) + 5);
          adminsData.push(Math.floor(Math.random() * 5) + 1);
        }
        break;
      case '7d':
        for (let i = 6; i >= 0; i--) {
          const day = new Date();
          day.setDate(day.getDate() - i);
          labels.push(day.toLocaleDateString('es-ES', { weekday: 'short' }));
          studentsData.push(Math.floor(Math.random() * 300) + 100);
          visitorsData.push(Math.floor(Math.random() * 150) + 50);
          adminsData.push(Math.floor(Math.random() * 20) + 5);
        }
        break;
      case '30d':
        for (let i = 29; i >= 0; i--) {
          const day = new Date();
          day.setDate(day.getDate() - i);
          labels.push(day.getDate().toString());
          studentsData.push(Math.floor(Math.random() * 500) + 200);
          visitorsData.push(Math.floor(Math.random() * 200) + 100);
          adminsData.push(Math.floor(Math.random() * 30) + 10);
        }
        break;
    }

    this.charts.mainActivity.data.labels = labels;
    this.charts.mainActivity.data.datasets[0].data = studentsData;
    this.charts.mainActivity.data.datasets[1].data = visitorsData;
    this.charts.mainActivity.data.datasets[2].data = adminsData;
    this.charts.mainActivity.update('active');
  }

  // Actualizar KPIs con animación
  updateKPIs(data) {
    this.animateValue('total-students', data.students || 0);
    this.animateValue('total-visitors', data.visitors || 0);
    this.animateValue('active-sessions', data.sessions || 0);
    this.animateValue('total-admins', data.admins || 0);
  }

  // Animar valores numéricos
  animateValue(elementId, targetValue, duration = 1000) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const startValue = parseInt(element.textContent) || 0;
    const increment = (targetValue - startValue) / (duration / 16);
    let currentValue = startValue;

    const timer = setInterval(() => {
      currentValue += increment;
      if ((increment > 0 && currentValue >= targetValue) || 
          (increment < 0 && currentValue <= targetValue)) {
        currentValue = targetValue;
        clearInterval(timer);
      }
      element.textContent = Math.floor(currentValue).toLocaleString();
    }, 16);
  }

  // Destruir todos los gráficos
  destroy() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.charts = {};
  }

  // Redimensionar gráficos
  resize() {
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.resize === 'function') {
        chart.resize();
      }
    });
  }
}

// Exportar la clase para uso en otros módulos
window.DashboardCharts = DashboardCharts;