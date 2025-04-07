const ratingGroup = document.getElementById('rating-group');
for (let i = 0; i <= 10; i++) {
  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'dayRating';
  input.id = `rate-${i}`;
  input.value = i;

  const label = document.createElement('label');
  label.htmlFor = `rate-${i}`;
  label.textContent = i;

  ratingGroup.appendChild(input);
  ratingGroup.appendChild(label);
}

const profileForm = document.getElementById('profile-form');
const profileSummary = document.getElementById('profile-summary');
const dailyForm = document.getElementById('daily-form');
const dailySummary = document.getElementById('daily-summary');
const historyList = document.getElementById('history-list');
const weeklyAverage = document.getElementById('weekly-average');

let chartData = {
  labels: ['Bom dia?', 'Água suficiente?'],
  datasets: [{
    data: [],
    backgroundColor: [],
  }]
};

const ctx = document.getElementById('heatmapChart').getContext('2d');
const heatmapChart = new Chart(ctx, {
  type: 'bar',
  data: chartData,
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, max: 10 }
    }
  }
});

function salvarNoLocalStorage(chave, valor) {
  localStorage.setItem(chave, JSON.stringify(valor));
}

function carregarDoLocalStorage(chave) {
  return JSON.parse(localStorage.getItem(chave));
}

function atualizarHistorico(dia) {
  const historico = carregarDoLocalStorage('historico') || [];
  historico.push(dia);
  if (historico.length > 7) historico.shift(); // só últimos 7 dias
  salvarNoLocalStorage('historico', historico);
  mostrarHistorico(historico);
  mostrarMedia(historico);
}

function mostrarHistorico(lista) {
  historyList.innerHTML = '';
  lista.forEach((dia, i) => {
    const li = document.createElement('li');
    li.textContent = `Dia ${i + 1}: Nota ${dia.nota}, Água: ${dia.agua}`;
    historyList.appendChild(li);
  });
}

function mostrarMedia(lista) {
  const notas = lista.map(d => d.nota);
  const media = (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1);
  weeklyAverage.textContent = `Média de humor da semana: ${media}`;
}

window.addEventListener('load', () => {
  const perfil = carregarDoLocalStorage('perfil');
  if (perfil) {
    profileSummary.innerHTML = `
      <strong>Resumo do Perfil</strong><br><br>
      <strong>Nome:</strong> ${perfil.nome}<br>
      <strong>Idade:</strong> ${perfil.idade}<br>
      <strong>Objetivo:</strong> ${perfil.objetivo}
    `;
  }

  const historico = carregarDoLocalStorage('historico');
  if (historico) {
    mostrarHistorico(historico);
    mostrarMedia(historico);
  }
});

profileForm.addEventListener('submit', e => {
  e.preventDefault();
  const nome = document.getElementById('name').value;
  const idade = document.getElementById('age').value;
  const objetivo = document.getElementById('goal').value;

  const perfil = { nome, idade, objetivo };
  salvarNoLocalStorage('perfil', perfil);

  profileSummary.innerHTML = `
    <strong>Resumo do Perfil</strong><br><br>
    <strong>Nome:</strong> ${nome}<br>
    <strong>Idade:</strong> ${idade}<br>
    <strong>Objetivo:</strong> ${objetivo}
  `;
});

dailyForm.addEventListener('submit', e => {
  e.preventDefault();

  const nota = parseInt(document.querySelector('input[name="dayRating"]:checked')?.value || 0);
  const agua = document.querySelector('input[name="water"]:checked')?.value || 'Não';
  const atividades = [...document.querySelectorAll('input[name="activity"]:checked')].map(a => a.value).join(', ');

  const perfil = carregarDoLocalStorage('perfil') || { nome: '', idade: '', objetivo: '' };

  dailySummary.innerHTML = `
    <strong>Resumo Diário de ${perfil.nome}</strong><br>
    <strong>Idade:</strong> ${perfil.idade}<br>
    <strong>Objetivo:</strong> ${perfil.objetivo}<br><br>
    <strong>Atividades:</strong> ${atividades}
  `;

  chartData.datasets[0].data = [nota, agua === 'Sim' ? 10 : 2];
  chartData.datasets[0].backgroundColor = [
    nota >= 6 ? '#7fc97f' : '#fdd835',
    agua === 'Sim' ? '#7fc97f' : '#fdd835'
  ];
  heatmapChart.update();

  atualizarHistorico({ nota, agua });
});
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(function() {
        console.log('Service Worker registrado com sucesso!');
      })
      .catch(function(error) {
        console.log('Erro ao registrar Service Worker:', error);
      });
  }
  
