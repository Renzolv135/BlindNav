// Elementos da interface
const detectButton = document.getElementById("detect-obstacles")
const detectText = document.getElementById("detect-text")
const voiceButton = document.getElementById("voice-command")
const voiceText = document.getElementById("voice-text")
const toggleAudioButton = document.getElementById("toggle-audio")
const audioIcon = document.getElementById("audio-icon")
const locationStatus = document.getElementById("location-status")
const locationValue = document.getElementById("location-value")
const audioValue = document.getElementById("audio-value")
const detectionValue = document.getElementById("detection-value")
const lastCommandContainer = document.getElementById("last-command-container")
const lastCommandValue = document.getElementById("last-command-value")
const quickCommandButtons = document.querySelectorAll(".quick-command-btn")
const navToggle = document.getElementById("nav-toggle")
const navMenu = document.getElementById("nav-menu")
const header = document.querySelector(".main-header")

// Estado da aplicação
const state = {
  isListening: false,
  isDetecting: false,
  isSpeaking: false,
  audioEnabled: true,
  location: null,
  lastCommand: "",
  recognition: null,
}

// Simulação de obstáculos detectados
const simulatedObstacles = [
  "Degrau de 15 centímetros detectado à frente. Proceda com cautela.",
  "Poste de iluminação identificado à sua direita, aproximadamente 2 metros de distância.",
  "Irregularidade na calçada detectada em 5 metros. Recomenda-se atenção redobrada.",
  "Entrada de garagem localizada à sua esquerda. Área livre para passagem.",
  "Obstáculo temporário removido. Caminho completamente desobstruído à frente.",
  "Mobiliário urbano detectado. Banco público à direita em 3 metros.",
  "Mudança de elevação identificada. Rampa de acesso em 4 metros.",
  "Semáforo para pedestres localizado em 10 metros à frente.",
  "Bicicleta estacionada detectada à direita. Mantenha distância segura.",
  "Canteiro de obras identificado. Desvio recomendado pela esquerda.",
]

// Respostas sofisticadas para comandos
const sophisticatedResponses = {
  location: "Sua posição atual foi determinada com precisão. Sistema GPS ativo e coordenadas obtidas com sucesso.",
  surroundings:
    "Ambiente urbano identificado. Calçada pavimentada à frente com largura adequada para passagem. Poste de iluminação pública à direita em 3 metros. Faixa de pedestres acessível localizada em 20 metros. Ambiente seguro para navegação contínua.",
  navigation:
    "Sistema de navegação inteligente ativado. Aguardando destino para cálculo de rota otimizada com considerações de acessibilidade.",
  repeat:
    "Repetindo instrução anterior: Caminho livre à frente por 10 metros. Mantenha direção atual com velocidade moderada.",
  help: "Comandos disponíveis no sistema BlindNav: 'Onde estou' para localização atual, 'Descrever arredores' para análise do ambiente, 'Navegar para destino' para roteamento, 'Repetir última instrução' para confirmação. Sistema operacional e pronto para assistência contínua.",
}

// Funções de navegação suave
function scrollToApp() {
  document.getElementById("app").scrollIntoView({ behavior: "smooth" })
}

function scrollToFeatures() {
  document.getElementById("funcionalidades").scrollIntoView({ behavior: "smooth" })
}

// Inicialização
function init() {
  // Inicializar reconhecimento de voz
  initSpeechRecognition()

  // Obter localização
  initGeolocation()

  // Configurar event listeners
  setupEventListeners()

  // Configurar navegação móvel
  setupMobileNavigation()

  // Configurar efeito de scroll no header
  setupScrollEffect()

  // Mensagem de boas-vindas
  setTimeout(() => {
    speak("Sistema BlindNav inicializado com sucesso. Bem-vindo à navegação urbana acessível premium.")
  }, 1000)
}

// Configurar efeito de scroll no header
function setupScrollEffect() {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled")
    } else {
      header.classList.remove("scrolled")
    }
  })
}

// Configurar navegação móvel
function setupMobileNavigation() {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active")
  })

  // Fechar menu ao clicar em um link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active")
    })
  })
}

// Inicializar reconhecimento de voz
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (SpeechRecognition) {
    state.recognition = new SpeechRecognition()
    state.recognition.continuous = false
    state.recognition.interimResults = false
    state.recognition.lang = "pt-BR"

    state.recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase()
      state.lastCommand = command
      lastCommandValue.textContent = command
      lastCommandContainer.classList.remove("hidden")

      // Adicionar efeito visual ao comando
      lastCommandContainer.style.animation = "fadeIn 0.5s ease"
      setTimeout(() => {
        lastCommandContainer.style.animation = ""
      }, 500)

      handleVoiceCommand(command)
    }

    state.recognition.onend = () => {
      state.isListening = false
      voiceButton.classList.remove("voice-active")
      voiceText.textContent = "ATIVAR VOZ"
    }

    state.recognition.onerror = (event) => {
      console.error("Erro no reconhecimento de voz:", event.error)
      speak("Erro no reconhecimento de voz. Verifique as permissões do microfone e tente novamente.")
      state.isListening = false
      voiceButton.classList.remove("voice-active")
      voiceText.textContent = "ATIVAR VOZ"
    }
  } else {
    speak("Reconhecimento de voz não disponível neste navegador. Recomendamos o uso do Google Chrome.")
    voiceButton.disabled = true
    voiceText.textContent = "VOZ NÃO SUPORTADA"
  }
}

// Inicializar geolocalização
function initGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        state.location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }
        locationStatus.textContent = "Localizado"
        locationValue.textContent = "Sistema Ativo"
        speak(sophisticatedResponses.location)
      },
      (error) => {
        console.error("Erro de geolocalização:", error)
        locationStatus.textContent = "Erro de GPS"
        locationValue.textContent = "Indisponível"
        speak("Sistema de localização temporariamente indisponível. Algumas funcionalidades podem estar limitadas.")
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    )
  } else {
    locationStatus.textContent = "GPS não suportado"
    locationValue.textContent = "Não suportado"
    speak("Sistema de geolocalização não suportado neste dispositivo.")
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Botão de detecção de obstáculos
  detectButton.addEventListener("click", detectObstacles)

  // Botão de comando de voz
  voiceButton.addEventListener("click", startVoiceCommand)

  // Botão de alternar áudio
  toggleAudioButton.addEventListener("click", toggleAudio)

  // Botões de comando rápido
  quickCommandButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const command = button.getAttribute("data-command")

      // Efeito visual no botão
      button.style.transform = "scale(0.95)"
      setTimeout(() => {
        button.style.transform = ""
      }, 150)

      handleVoiceCommand(command)
    })
  })

  // Teclas de atalho
  document.addEventListener("keydown", (event) => {
    // Tecla D para detecção
    if (event.key === "d" || event.key === "D") {
      event.preventDefault()
      detectObstacles()
    }
    // Tecla V para voz
    if (event.key === "v" || event.key === "V") {
      event.preventDefault()
      startVoiceCommand()
    }
    // Tecla A para alternar áudio
    if (event.key === "a" || event.key === "A") {
      event.preventDefault()
      toggleAudio()
    }
    // Tecla H para ajuda
    if (event.key === "h" || event.key === "H") {
      event.preventDefault()
      handleVoiceCommand("ajuda")
    }
    // Tecla Escape para cancelar ações
    if (event.key === "Escape") {
      event.preventDefault()
      if (state.isListening) {
        startVoiceCommand() // Cancela comando de voz
      }
    }
  })

  // Smooth scroll para links de navegação
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

// Função para falar texto com voz aprimorada
function speak(text) {
  if (!state.audioEnabled || state.isSpeaking) return

  state.isSpeaking = true

  // Cancelar qualquer fala anterior
  speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = "pt-BR"
  utterance.rate = 0.85 // Velocidade mais natural
  utterance.pitch = 1.0 // Tom neutro
  utterance.volume = 0.9

  // Tentar usar uma voz brasileira se disponível
  const voices = speechSynthesis.getVoices()
  const brazilianVoice =
    voices.find((voice) => voice.lang === "pt-BR") ||
    voices.find((voice) => voice.lang.includes("pt")) ||
    voices.find((voice) => voice.lang.includes("en"))

  if (brazilianVoice) {
    utterance.voice = brazilianVoice
  }

  utterance.onstart = () => {
    console.log("Iniciando fala:", text)
  }

  utterance.onend = () => {
    state.isSpeaking = false
    console.log("Fala concluída")
  }

  utterance.onerror = (event) => {
    console.error("Erro na síntese de voz:", event.error)
    state.isSpeaking = false
  }

  speechSynthesis.speak(utterance)
}

// Função para lidar com comandos de voz
function handleVoiceCommand(command) {
  console.log("Comando recebido:", command)

  if (command.includes("onde estou") || command.includes("localização") || command.includes("posição")) {
    if (state.location) {
      const accuracy = state.location.accuracy ? ` com precisão de ${Math.round(state.location.accuracy)} metros` : ""
      speak(
        `${sophisticatedResponses.location} Latitude: ${state.location.lat.toFixed(4)}, Longitude: ${state.location.lng.toFixed(4)}${accuracy}`,
      )
    } else {
      speak("Obtendo sua localização com precisão. Aguarde alguns instantes enquanto o sistema GPS é calibrado.")
    }
  } else if (command.includes("descrever") || command.includes("arredores") || command.includes("ambiente")) {
    speak(sophisticatedResponses.surroundings)
  } else if (command.includes("navegar") || command.includes("ir para") || command.includes("rota")) {
    speak(sophisticatedResponses.navigation)
  } else if (command.includes("repetir") || command.includes("última") || command.includes("anterior")) {
    speak(sophisticatedResponses.repeat)
  } else if (command.includes("ajuda") || command.includes("comandos") || command.includes("help")) {
    speak(sophisticatedResponses.help)
  } else if (command.includes("parar") || command.includes("cancelar") || command.includes("stop")) {
    speak("Operação cancelada. Sistema em standby.")
  } else if (command.includes("status") || command.includes("estado")) {
    const locationStatus = state.location ? "ativo" : "inativo"
    const audioStatus = state.audioEnabled ? "habilitado" : "desabilitado"
    speak(`Status do sistema: Localização ${locationStatus}, áudio ${audioStatus}, detecção em standby.`)
  } else {
    speak(
      "Comando não reconhecido pelo sistema BlindNav. Diga 'ajuda' para conhecer todos os comandos disponíveis ou tente reformular sua solicitação.",
    )
  }
}

// Função para iniciar comando de voz
function startVoiceCommand() {
  if (!state.recognition) {
    speak("Sistema de reconhecimento de voz não disponível neste navegador. Recomendamos o uso do Google Chrome.")
    return
  }

  if (state.isListening) {
    state.recognition.stop()
    state.isListening = false
    voiceButton.classList.remove("voice-active")
    voiceText.textContent = "ATIVAR VOZ"
    speak("Comando de voz cancelado. Sistema em standby.")
  } else {
    state.isListening = true
    voiceButton.classList.add("voice-active")
    voiceText.textContent = "CANCELAR"
    speak("Sistema de comando de voz ativado. Aguardando sua instrução.")

    setTimeout(() => {
      if (state.recognition && state.isListening) {
        try {
          state.recognition.start()
        } catch (error) {
          console.error("Erro ao iniciar reconhecimento:", error)
          speak("Erro ao ativar reconhecimento de voz. Tente novamente.")
          state.isListening = false
          voiceButton.classList.remove("voice-active")
          voiceText.textContent = "ATIVAR VOZ"
        }
      }
    }, 2000) // Aguardar a fala terminar
  }
}

// Função para detectar obstáculos
function detectObstacles() {
  if (state.isDetecting) return

  state.isDetecting = true
  detectButton.disabled = true
  detectText.textContent = "ANALISANDO..."
  detectionValue.textContent = "Sistema Ativo"

  // Adicionar efeito visual
  detectButton.style.opacity = "0.7"

  speak("Iniciando varredura de obstáculos com tecnologia premium. Análise do ambiente em progresso.")

  // Simular detecção por 4 segundos
  setTimeout(() => {
    const randomObstacle = simulatedObstacles[Math.floor(Math.random() * simulatedObstacles.length)]
    speak(randomObstacle)

    state.isDetecting = false
    detectButton.disabled = false
    detectButton.style.opacity = "1"
    detectText.textContent = "INICIAR DETECÇÃO"
    detectionValue.textContent = "Standby"
  }, 4000)
}

// Função para alternar áudio
function toggleAudio() {
  state.audioEnabled = !state.audioEnabled
  audioIcon.textContent = state.audioEnabled ? "🔊" : "🔇"
  audioValue.textContent = state.audioEnabled ? "Sistema Ativo" : "Desabilitado"

  // Efeito visual no botão
  toggleAudioButton.style.transform = "scale(1.2)"
  setTimeout(() => {
    toggleAudioButton.style.transform = ""
  }, 200)

  if (state.audioEnabled) {
    speak("Sistema de áudio premium reativado com sucesso.")
  }
}

// Função para atualizar localização periodicamente
function updateLocation() {
  if (navigator.geolocation && state.audioEnabled) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }

        // Verificar se houve mudança significativa na localização
        if (state.location) {
          const distance = calculateDistance(state.location, newLocation)
          if (distance > 50) {
            // Mudança significativa (mais de 50 metros)
            state.location = newLocation
            speak("Localização atualizada. Nova posição registrada.")
          }
        } else {
          state.location = newLocation
        }
      },
      (error) => {
        console.error("Erro ao atualizar localização:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      },
    )
  }
}

// Função para calcular distância entre duas coordenadas
function calculateDistance(pos1, pos2) {
  const R = 6371e3 // Raio da Terra em metros
  const φ1 = (pos1.lat * Math.PI) / 180
  const φ2 = (pos2.lat * Math.PI) / 180
  const Δφ = ((pos2.lat - pos1.lat) * Math.PI) / 180
  const Δλ = ((pos2.lng - pos1.lng) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distância em metros
}

// Inicializar aplicação quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", init)

// Carregar vozes quando disponíveis
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = () => {
    console.log("Vozes carregadas:", speechSynthesis.getVoices().length)
  }
}

// Atualizar localização a cada 2 minutos
setInterval(updateLocation, 120000)

// Adicionar suporte a PWA
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault()
  console.log("PWA pode ser instalado")
})

// Detectar se está sendo executado como PWA
window.addEventListener("appinstalled", () => {
  console.log("PWA instalado com sucesso")
  speak("BlindNav foi instalado como aplicativo. Agora você pode acessá-lo diretamente da tela inicial.")
})

// Função global para scroll suave
window.scrollToApp = scrollToApp
window.scrollToFeatures = scrollToFeatures
