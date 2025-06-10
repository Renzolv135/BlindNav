"use client"

import { useState, useEffect, useRef } from "react"
import { Mic, Eye, MapPin, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import SpeechRecognition from "speech-recognition"

export default function BlindNavApp() {
  const [isListening, setIsListening] = useState(false)
  const [isDetecting, setIsDetecting] = useState(false)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [lastCommand, setLastCommand] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Simulação de obstáculos detectados
  const simulatedObstacles = [
    "Degrau de 15cm à frente",
    "Poste à direita em 2 metros",
    "Calçada irregular em 5 metros",
    "Entrada de garagem à esquerda",
    "Obstáculo temporário removido - caminho livre",
  ]

  // Inicializar reconhecimento de voz
  useEffect(() => {
    if (typeof window !== "undefined" && SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "pt-BR"

      recognitionRef.current.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase()
        setLastCommand(command)
        handleVoiceCommand(command)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    // Obter localização
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          speak("Localização obtida com sucesso")
        },
        (error) => {
          speak("Não foi possível obter sua localização")
        },
      )
    }
  }, [])

  const speak = (text: string) => {
    if (!audioEnabled || isSpeaking) return

    setIsSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = "pt-BR"
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onend = () => {
      setIsSpeaking(false)
    }

    speechSynthesis.speak(utterance)
  }

  const handleVoiceCommand = (command: string) => {
    if (command.includes("onde estou") || command.includes("localização")) {
      if (location) {
        speak(`Você está nas coordenadas ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`)
      } else {
        speak("Obtendo sua localização, aguarde")
      }
    } else if (command.includes("descrever") || command.includes("arredores")) {
      speak(
        "Você está em uma calçada urbana. Há um poste de luz à sua direita em aproximadamente 3 metros. À frente, a calçada continua reta por mais 20 metros.",
      )
    } else if (command.includes("navegar") || command.includes("ir para")) {
      speak("Função de navegação ativada. Para onde você gostaria de ir?")
    } else if (command.includes("repetir")) {
      speak("Repetindo última instrução: Caminho livre à frente por 10 metros")
    } else if (command.includes("ajuda")) {
      speak("Comandos disponíveis: Onde estou, Descrever arredores, Navegar para, Repetir instrução")
    } else {
      speak("Comando não reconhecido. Diga 'ajuda' para ver os comandos disponíveis")
    }
  }

  const startVoiceCommand = () => {
    if (!recognitionRef.current) {
      speak("Reconhecimento de voz não disponível neste navegador")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      speak("Comando de voz cancelado")
    } else {
      setIsListening(true)
      speak("Escutando comando")
      recognitionRef.current.start()
    }
  }

  const detectObstacles = () => {
    if (isDetecting) return

    setIsDetecting(true)
    speak("Iniciando detecção de obstáculos")

    // Simular detecção por 3 segundos
    setTimeout(() => {
      const randomObstacle = simulatedObstacles[Math.floor(Math.random() * simulatedObstacles.length)]
      speak(randomObstacle)
      setIsDetecting(false)
    }, 3000)
  }

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled)
    speak(audioEnabled ? "Áudio desabilitado" : "Áudio habilitado")
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-yellow-400 mb-2">BlindNav</h1>
        <p className="text-xl text-gray-300">Navegação Acessível para Todos</p>
        <div className="flex justify-center items-center gap-4 mt-4">
          <Badge variant="secondary" className="bg-green-800 text-green-100">
            <MapPin className="w-4 h-4 mr-1" />
            {location ? "Localizado" : "Localizando..."}
          </Badge>
          <Button variant="ghost" size="sm" onClick={toggleAudio} className="text-yellow-400 hover:bg-gray-800">
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Main Controls */}
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-900 border-yellow-400 border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-yellow-400 text-2xl">Detectar Obstáculos</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={detectObstacles}
                disabled={isDetecting}
                className="w-full h-20 text-xl bg-yellow-400 text-black hover:bg-yellow-500 disabled:bg-gray-600"
              >
                <Eye className="w-8 h-8 mr-3" />
                {isDetecting ? "Detectando..." : "Iniciar Detecção"}
              </Button>
              <p className="text-gray-400 mt-3 text-sm">Pressione para detectar obstáculos ao seu redor</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400 border-2">
            <CardHeader className="text-center">
              <CardTitle className="text-yellow-400 text-2xl">Comandos de Voz</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={startVoiceCommand}
                className={`w-full h-20 text-xl ${
                  isListening ? "bg-red-600 hover:bg-red-700" : "bg-yellow-400 text-black hover:bg-yellow-500"
                }`}
              >
                <Mic className="w-8 h-8 mr-3" />
                {isListening ? "Cancelar" : "Ativar Voz"}
              </Button>
              <p className="text-gray-400 mt-3 text-sm">Pressione para dar comandos por voz</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Information */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-yellow-400">Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gray-800 rounded">
                <p className="text-yellow-400 font-semibold">Localização</p>
                <p className="text-sm text-gray-300">{location ? "Ativa" : "Carregando..."}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded">
                <p className="text-yellow-400 font-semibold">Áudio</p>
                <p className="text-sm text-gray-300">{audioEnabled ? "Habilitado" : "Desabilitado"}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded">
                <p className="text-yellow-400 font-semibold">Detecção</p>
                <p className="text-sm text-gray-300">{isDetecting ? "Ativa" : "Standby"}</p>
              </div>
            </div>

            {lastCommand && (
              <div className="p-3 bg-blue-900 rounded">
                <p className="text-blue-300 font-semibold">Último Comando:</p>
                <p className="text-white">{lastCommand}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Commands */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-yellow-400">Comandos Rápidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 text-left justify-start border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                onClick={() => handleVoiceCommand("onde estou")}
              >
                "Onde estou?"
              </Button>
              <Button
                variant="outline"
                className="h-12 text-left justify-start border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                onClick={() => handleVoiceCommand("descrever arredores")}
              >
                "Descrever arredores"
              </Button>
              <Button
                variant="outline"
                className="h-12 text-left justify-start border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                onClick={() => handleVoiceCommand("repetir")}
              >
                "Repetir instrução"
              </Button>
              <Button
                variant="outline"
                className="h-12 text-left justify-start border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                onClick={() => handleVoiceCommand("ajuda")}
              >
                "Ajuda"
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="text-center mt-12 text-gray-500">
        <p>BlindNav - Feira de Ciências 2025</p>
        <p className="text-sm">Navegação urbana acessível para pessoas com deficiência visual</p>
      </footer>
    </div>
  )
}
