"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import ErrorModal from "@/components/error-modal"

const DEFAULT_REFERRAL_ID = "110956" // Francisco Eliedisom Dos Santos

const BRAZILIAN_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
]

const PLANS = {
  VIVO: [
    { id: "178", name: "40GB COM LIGACAO", price: 49.9, esim: true },
    { id: "69", name: "80GB COM LIGACAO", price: 69.9, esim: true },
    { id: "61", name: "150GB COM LIGACAO", price: 99.9, esim: true },
  ],
  TIM: [
    { id: "56", name: "100GB COM LIGACAO", price: 69.9, esim: true },
    { id: "154", name: "200GB SEM LIGAÇÃO", price: 159.9, esim: true },
    { id: "155", name: "300GB SEM LIGAÇÃO", price: 199.9, esim: true },
  ],
  CLARO: [
    { id: "57", name: "80GB COM LIGACAO", price: 69.9, esim: true },
    { id: "183", name: "150GB COM LIGACAO", price: 99.9, esim: true },
  ],
}

interface Representante {
  id: string
  nome: string
  whatsapp: string
}

interface RegistrationFormProps {
  representante?: Representante
}

const STEP_TITLES = [
  "Qual o tipo de chip você deseja utilizar?",
  "Em qual cobertura você deseja ativar seu plano?",
  "Dados Pessoais",
  "Contato",
  "Endereço",
  "Forma de Envio",
]

export default function RegistrationForm({ representante }: RegistrationFormProps) {
  const REFERRAL_ID = representante?.id || DEFAULT_REFERRAL_ID

  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [cpfValidated, setCpfValidated] = useState(false)
  const [emailValidated, setEmailValidated] = useState(false)
  const [cepValid, setCepValid] = useState<boolean | null>(null)
  const [birthValid, setBirthValid] = useState<boolean | null>(null)
  const [whatsappValid, setWhatsappValid] = useState<boolean | null>(null)
  const [whatsappValidating, setWhatsappValidating] = useState(false)

  const [formData, setFormData] = useState({
    cpf: "",
    birth: "",
    name: "",
    email: "",
    cell: "",
    cep: "",
    district: "",
    city: "",
    state: "",
    street: "",
    number: "",
    complement: "",
    typeChip: "",
    coupon: "",
    plan_id: "",
    typeFrete: "",
  })

  // ── Masks ──
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2")
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3")
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3")
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    return numbers.replace(/(\d{5})(\d{0,3})/, "$1-$2")
  }

  const formatDateInput = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 2) return numbers
    if (numbers.length <= 4) return numbers.replace(/(\d{2})(\d{0,2})/, "$1/$2")
    return numbers.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3")
  }

  const convertDateToISO = (dateStr: string): string => {
    const numbers = dateStr.replace(/\D/g, "")
    if (numbers.length !== 8) return ""
    const day = numbers.substring(0, 2)
    const month = numbers.substring(2, 4)
    const year = numbers.substring(4, 8)
    return `${year}-${month}-${day}`
  }

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value
    if (field === "cpf") formattedValue = formatCPF(value)
    else if (field === "cell") formattedValue = formatPhone(value)
    else if (field === "birth") {
      formattedValue = formatDateInput(value)
      const numbers = value.replace(/\D/g, "")
      setBirthValid(numbers.length === 8 ? true : numbers.length > 0 ? false : null)
    } else if (field === "cep") formattedValue = formatCEP(value)
    setFormData((prev) => ({ ...prev, [field]: formattedValue }))
  }

  // ── Validations (untouched logic) ──
  const validateWhatsApp = async (phone: string) => {
    const numbers = phone.replace(/\D/g, "")
    if (numbers.length < 10 || numbers.length > 11) { setWhatsappValid(false); return }
    setWhatsappValidating(true)
    try {
      const waNumber = `55${numbers}`
      const response = await fetch("https://webhook.fiqon.app/webhook/019b97c2-6aed-7162-8a3a-1fd63694ecd6/5fb591d0-1499-4928-9b9f-198abec46afe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat: { phone: waNumber } }),
      })
      const data = await response.json()
      if (data.existe === true) { setWhatsappValid(true) }
      else {
        setWhatsappValid(false)
        toast({ title: "WhatsApp inválido", description: "O número informado não possui WhatsApp. Por favor, verifique.", variant: "destructive" })
      }
    } catch (error) {
      console.error("Erro ao validar WhatsApp:", error)
      setWhatsappValid(false)
      toast({ title: "Erro na validação", description: "Não foi possível validar o WhatsApp. Tente novamente.", variant: "destructive" })
    } finally { setWhatsappValidating(false) }
  }

  const fetchAddressByCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, "")
    if (cleanCEP.length !== 8) { setCepValid(null); return }
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()
      if (!data.erro) {
        setCepValid(true)
        setFormData((prev) => ({ ...prev, street: data.logradouro || "", district: data.bairro || "", city: data.localidade || "", state: data.uf || "" }))
      } else { setCepValid(false) }
    } catch (error) { console.error("Erro ao buscar CEP:", error); setCepValid(false) }
  }

  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, "")
    if (cleanCPF.length !== 11) return false
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false
    let sum = 0; let remainder
    for (let i = 1; i <= 9; i++) sum += Number.parseInt(cleanCPF.substring(i - 1, i)) * (11 - i)
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(cleanCPF.substring(9, 10))) return false
    sum = 0
    for (let i = 1; i <= 10; i++) sum += Number.parseInt(cleanCPF.substring(i - 1, i)) * (12 - i)
    remainder = (sum * 10) % 11
    if (remainder === 10 || remainder === 11) remainder = 0
    if (remainder !== Number.parseInt(cleanCPF.substring(10, 11))) return false
    return true
  }

  const validateCPFWithAPI = async (cpf: string, birthDisplay: string) => {
    const cleanCPF = cpf.replace(/\D/g, "")
    const birthISO = convertDateToISO(birthDisplay)
    if (cleanCPF.length !== 11 || !birthISO) return
    try {
      const [year, month, day] = birthISO.split("-")
      const formattedBirth = `${day}-${month}-${year}`
      const response = await fetch(`https://apicpf.whatsgps.com.br/api/cpf/search?numeroDeCpf=${cleanCPF}&dataNascimento=${formattedBirth}&token=2|VL3z6OcyARWRoaEniPyoHJpPtxWcD99NN2oueGGn4acc0395`)
      const data = await response.json()
      if (data.data && data.data.id) {
        setFormData((prev) => ({ ...prev, name: data.data.nome_da_pf || "" }))
        setCpfValidated(true)
        toast({ title: "CPF validado!", description: "Dados preenchidos automaticamente." })
      } else {
        toast({ title: "CPF não encontrado", description: "Verifique o CPF e data de nascimento.", variant: "destructive" })
      }
    } catch (error) { console.error("Erro ao validar CPF:", error) }
  }

  const validateEmail = async (email: string) => {
    if (!email) return
    try {
      const response = await fetch(`https://federalassociados.com.br/getEmail/${email}`)
      const data = await response.json()
      if (data.status === "success") {
        setEmailValidated(true)
        toast({ title: "Email validado!", description: "Email confirmado com sucesso." })
      } else if (data.status === "error") {
        toast({ title: "Erro", description: data.msg || "Email já cadastrado ou inválido.", variant: "destructive" })
      }
    } catch (error) { console.error("Erro ao validar email:", error) }
  }

  const validateCoupon = async (coupon: string) => {
    if (!coupon) return
    try {
      const response = await fetch(`https://federalassociados.com.br/getValidateCoupon/${coupon}`)
      const data = await response.json()
      if (data.status === "success") toast({ title: "Cupom válido!", description: data.msg || "Cupom aplicado com sucesso." })
      else if (data.status === "error") toast({ title: "Cupom inválido", description: data.msg || "Verifique o código do cupom.", variant: "destructive" })
    } catch (error) { console.error("Erro ao validar cupom:", error) }
  }

  // ── Submit (untouched logic) ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!validateCPF(formData.cpf)) {
      setErrorMessage("CPF inválido! Por favor, verifique o CPF informado.")
      setShowErrorModal(true); setLoading(false); return
    }
    if (cepValid === false) {
      setErrorMessage("CEP inválido! Por favor, verifique o CEP informado e corrija antes de continuar.")
      setShowErrorModal(true); setLoading(false); return
    }
    if (!formData.plan_id) {
      setErrorMessage("Por favor, selecione um plano antes de continuar.")
      setShowErrorModal(true); setLoading(false); return
    }
    if (!formData.typeFrete) {
      setErrorMessage("Por favor, selecione a forma de envio antes de continuar.")
      setShowErrorModal(true); setLoading(false); return
    }

    try {
      const selectedPlan = Object.values(PLANS).flat().find((plan) => plan.id === formData.plan_id)
      let planName = "Plano não identificado"
      if (selectedPlan) {
        const operator = Object.keys(PLANS).find((key) => PLANS[key as keyof typeof PLANS].some((p) => p.id === formData.plan_id))
        planName = `${operator} - ${selectedPlan.name}`
      }

      let formaEnvio = ""
      if (formData.typeFrete === "Carta") formaEnvio = "Carta Registrada"
      else if (formData.typeFrete === "semFrete") formaEnvio = "Retirar na Associação"
      else if (formData.typeFrete === "eSim") formaEnvio = "e-SIM"

      const webhookData = {
        nome: formData.name, cpf: formData.cpf, data_nascimento: formData.birth, email: formData.email,
        whatsapp: formData.cell, telefone_fixo: "", plano: planName, plan_id: formData.plan_id,
        tipo_chip: formData.typeChip === "fisico" ? "Físico" : "e-SIM", forma_envio: formaEnvio,
        cep: formData.cep, endereco: formData.street, numero: formData.number, complemento: formData.complement,
        bairro: formData.district, cidade: formData.city, estado: formData.state, referral_id: REFERRAL_ID,
      }

      const webhookURLs: { [key: string]: string } = {
        "110956": "https://webhook.fiqon.app/webhook/a0265c1b-d832-483e-af57-8096334a57a8/e167dea4-079e-4af4-9b3f-4acaf711f432",
        "167641": "https://webhook.fiqon.app/webhook/019be607-7078-705b-8c4d-47af993d4398/1006eb2e-eb37-4cff-a327-893d15364c02",
        "110403": "https://webhook.fiqon.app/webhook/019a82d0-9018-73a8-9702-405595187191/15c6ef7c-a0c0-4b0a-b6cf-f873564be560",
        "88389": "https://webhook.fiqon.app/webhook/a02ccd6f-0d2f-401d-8d9b-c9e161d5330e/0624b4b1-d658-44d1-8291-ed8f0b5b3bf9",
        "159726": "https://webhook.fiqon.app/webhook/019b9b1f-c2eb-716c-a0af-b729f6f83256/3a70ef2a-050a-46b8-883a-a2ea63d93243",
        "140894": "https://webhook.fiqon.app/webhook/019b9b2c-14e4-702c-b2e8-03caeb5615d4/6cc39296-2244-42e3-8e45-0bd92dae42bb",
        "163994": "https://webhook.fiqon.app/webhook/019b9b0b-36fb-702e-aef4-788e7eb1c58d/655162cf-6868-4e73-92dd-c43ef37279fb",
        "131966": "https://webhook.fiqon.app/webhook/a0436edd-0f48-454c-9fc2-f916fee56e34/ffc2252d-f738-4870-8287-81ea51a89542",
        "108054": "https://webhook.fiqon.app/webhook/019b9b3f-4c25-7378-97f3-27329fcef7d1/50b76f62-30b6-431b-bbf4-cd5739412da3",
        "166779": "https://webhook.fiqon.app/webhook/019c4813-3f06-7021-aee4-2e794c82bcd5/8013cf50-adf6-4f91-8267-4569e0a3ddb4",
        "119294": "https://webhook.fiqon.app/webhook/019b9b15-2a9e-70a5-8ca1-19ac2e236a62/036e9dc0-0f7c-44b9-b16d-98b28832960f",
      }

      const webhookURL = webhookURLs[REFERRAL_ID]
      if (!webhookURL) {
        setErrorMessage("Representante não encontrado. Favor verificar.")
        setShowErrorModal(true); setLoading(false); return
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000)

      try {
        const response = await fetch(webhookURL, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(webhookData), signal: controller.signal,
        })
        clearTimeout(timeoutId)

        const responseText = await response.text()
        let webhookMessage = ""
        try {
          const responseData = JSON.parse(responseText)
          webhookMessage = responseData.message || responseData.msg || responseData.mensagem || ""
        } catch { webhookMessage = responseText.trim() }

        if (webhookMessage) {
          const lowerMessage = webhookMessage.toLowerCase()
          const isError = lowerMessage.includes("erro") || lowerMessage.includes("já") || lowerMessage.includes("inválido") || lowerMessage.includes("falha") || lowerMessage.includes("não") || lowerMessage.includes("sendo utilizado") || !response.ok
          if (isError) { setErrorMessage(webhookMessage); setShowErrorModal(true); setLoading(false); return }
          setSuccessMessage(webhookMessage); setLoading(false); setShowSuccessModal(true); return
        }
        if (response.ok) { setSuccessMessage("Cadastro realizado com sucesso!"); setLoading(false); setShowSuccessModal(true); return }
        setErrorMessage("Erro ao processar cadastro. Tente novamente."); setShowErrorModal(true); setLoading(false)
      } catch (fetchError: unknown) {
        clearTimeout(timeoutId)
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          setErrorMessage("Tempo limite excedido. O servidor está demorando para responder. Tente novamente.")
          setShowErrorModal(true); setLoading(false); return
        }
        throw fetchError
      }
    } catch (error) {
      console.error("Erro ao processar cadastro:", error)
      setErrorMessage("Não foi possível completar o cadastro. Verifique sua conexão e tente novamente.")
      setShowErrorModal(true); setLoading(false)
    }
  }

  // ── Step validation ──
  const canContinue = (): boolean => {
    switch (step) {
      case 0: return formData.typeChip !== ""
      case 1: return formData.plan_id !== ""
      case 2: return formData.cpf.replace(/\D/g, "").length === 11 && formData.birth.replace(/\D/g, "").length === 8 && formData.name.trim() !== ""
      case 3: return formData.email.trim() !== "" && formData.cell.replace(/\D/g, "").length >= 10
      case 4: return formData.cep.replace(/\D/g, "").length === 8 && formData.district.trim() !== "" && formData.city.trim() !== "" && formData.state !== "" && formData.street.trim() !== ""
      case 5: return formData.typeFrete !== ""
      default: return false
    }
  }

  const goNext = () => { if (canContinue() && step < 5) setStep(step + 1) }
  const goBack = () => { if (step > 0) setStep(step - 1) }

  useEffect(() => {
    const video = document.createElement("video")
    video.preload = "auto"
    video.src = "https://myehbxfidszreorsaexi.supabase.co/storage/v1/object/public/adesao/adesao.mp4"
    video.load()
  }, [])

  // ── Success modal ──
  if (showSuccessModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-lg p-6 mx-auto max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 text-center">
            {"Parabéns! Seu cadastro foi realizado com sucesso."}
          </h1>
          <div className="flex flex-col gap-3 text-gray-700 text-sm md:text-base leading-relaxed">
            <p>{"Para darmos continuidade com à ativação do seu plano, é necessário realizar o pagamento da sua taxa associativa, no valor proporcional ao plano escolhido por você."}</p>
            <p>{"Essa taxa é solicitada antes da ativação, pois ela confirma oficialmente a sua entrada na Federal Associados."}</p>
            <p className="font-semibold">{"O valor é usado para cobrir os custos administrativos e operacionais, como:"}</p>
            <ul className="list-disc list-inside ml-4 text-sm flex flex-col gap-1">
              <li>{"Geração do número."}</li>
              <li>{"Configuração da linha."}</li>
              <li>{"Liberação do seu escritório virtual."}</li>
              <li>{"E acesso a todos os benefícios exclusivos da empresa, como o Clube de Descontos, Cinema Grátis, Programa PBI, entre outros."}</li>
            </ul>
            <p>{"O pagamento da taxa é o primeiro passo para liberar o seu benefício de internet móvel e garantir sua ativação com total segurança."}</p>
            <p>{"Logo após efetuar o pagamento, você receberá um e-mail para fazer a biometria digital."}</p>
            <p className="font-semibold">{"Após isso já partimos para ativação do seu plano."}</p>
            <p className="text-center font-bold text-base md:text-lg mt-4">{"Clique no botão abaixo para continuar:"}</p>
          </div>
          <div className="flex justify-center mt-6">
            <Button onClick={() => (window.location.href = "https://federalassociados.com.br/boletos")} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base md:text-lg font-semibold rounded-lg shadow-lg">
              {"Realizar Adesão"}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ── Step indicator ──
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-1.5 mb-6">
      {STEP_TITLES.map((_, i) => (
        <div key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-8 bg-blue-600" : i < step ? "w-2 bg-blue-400" : "w-2 bg-gray-300"}`} />
      ))}
    </div>
  )

  // ── Render ──
  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-6">
        {step === 0 && (
          <div className="text-center mb-2">
            <p className="text-sm sm:text-base text-gray-700">
              {"Preencha o formulario abaixo corretamente para ativarmos o seu plano na Federal Associados. Cadastro rapido, sem consulta ao SPC/SERASA e sem fidelidade."}
            </p>
          </div>
        )}
        <StepIndicator />
        <h2 className="text-lg md:text-xl font-semibold text-center text-gray-800">{STEP_TITLES[step]}</h2>

        {/* BLOCO 1 - Tipo de Chip */}
        {step === 0 && (
          <Card>
            <CardContent className="pt-6 px-6">
              <RadioGroup
                value={formData.typeChip}
                onValueChange={(value) => {
                  handleInputChange("typeChip", value)
                  handleInputChange("plan_id", "")
                  handleInputChange("typeFrete", "")
                }}
                className="flex flex-col gap-4"
              >
                <label htmlFor="chip-fisico" className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${formData.typeChip === "fisico" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <RadioGroupItem value="fisico" id="chip-fisico" />
                  <div>
                    <span className="font-medium text-gray-900">{"Físico"}</span>
                    <p className="text-sm text-gray-500">{"Chip tradicional enviado pelos Correios ou retirado presencialmente"}</p>
                  </div>
                </label>
                <label htmlFor="chip-esim" className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${formData.typeChip === "eSim" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <RadioGroupItem value="eSim" id="chip-esim" />
                  <div>
                    <span className="font-medium text-gray-900">{"e-SIM"}</span>
                    <p className="text-sm text-gray-500">{"Chip digital ativado diretamente no seu aparelho compatível"}</p>
                  </div>
                </label>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* BLOCO 2 - Plano */}
        {step === 1 && (
          <Card>
            <CardContent className="pt-6 px-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="plan">{"Plano"} <span className="text-red-500">*</span></Label>
                <Select value={formData.plan_id} onValueChange={(value) => handleInputChange("plan_id", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-sm font-semibold pointer-events-none" style={{ color: "#8B5CF6" }}>{"VIVO"}</div>
                    {PLANS.VIVO.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id} className="text-gray-900 font-medium">
                        {plan.name} - R$ {plan.price.toFixed(2).replace(".", ",")}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-sm font-semibold mt-2 pointer-events-none" style={{ color: "#1E90FF" }}>{"TIM"}</div>
                    {PLANS.TIM.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id} className="text-gray-900 font-medium">
                        {plan.name} - R$ {plan.price.toFixed(2).replace(".", ",")}
                      </SelectItem>
                    ))}
                    <div className="px-2 py-1.5 text-sm font-semibold mt-2 pointer-events-none" style={{ color: "#DC143C" }}>{"CLARO"}</div>
                    {PLANS.CLARO.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id} className="text-gray-900 font-medium">
                        {plan.name} - R$ {plan.price.toFixed(2).replace(".", ",")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BLOCO 3 - Dados Pessoais */}
        {step === 2 && (
          <Card>
            <CardContent className="pt-6 px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cpf">{"CPF"} <span className="text-red-500">*</span></Label>
                  <Input id="cpf" value={formData.cpf} onChange={(e) => handleInputChange("cpf", e.target.value)} maxLength={14} required className={cpfValidated ? "border-green-500" : ""} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="birth">{"Data de Nascimento"} <span className="text-red-500">*</span></Label>
                  <Input id="birth" type="text" value={formData.birth} onChange={(e) => handleInputChange("birth", e.target.value)} onBlur={(e) => validateCPFWithAPI(formData.cpf, e.target.value)} maxLength={10} required className={birthValid === false ? "border-red-500 border-2" : birthValid === true ? "border-green-500" : ""} />
                  {birthValid === false && <p className="text-sm text-red-500 font-medium">{"Data incompleta! Digite no formato DD/MM/AAAA (8 dígitos)."}</p>}
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor="name">{"Nome Completo"} <span className="text-red-500">*</span></Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required readOnly={cpfValidated} className={cpfValidated ? "border-green-500" : ""} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BLOCO 4 - Contato */}
        {step === 3 && (
          <Card>
            <CardContent className="pt-6 px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">{"Email"} <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} onBlur={(e) => validateEmail(e.target.value)} required className={emailValidated ? "border-green-500" : ""} />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cell">{"WhatsApp"} <span className="text-red-500">*</span></Label>
                  <Input id="cell" value={formData.cell} onChange={(e) => handleInputChange("cell", e.target.value)} onBlur={(e) => { const numbers = e.target.value.replace(/\D/g, ""); if (numbers.length >= 10 && numbers.length <= 11) validateWhatsApp(e.target.value); else if (numbers.length > 0) setWhatsappValid(false) }} maxLength={15} required className={whatsappValid === false ? "border-red-500 border-2" : whatsappValid === true ? "border-green-500" : ""} />
                  {whatsappValidating && <p className="text-sm text-blue-600 font-medium">{"Validando WhatsApp..."}</p>}
                  {whatsappValid === false && !whatsappValidating && <p className="text-sm text-red-500 font-medium">{"WhatsApp inválido! Verifique o número digitado."}</p>}
                  {whatsappValid === true && <p className="text-sm text-green-600 font-medium">{"WhatsApp válido"}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BLOCO 5 - Endereço */}
        {step === 4 && (
          <Card>
            <CardContent className="pt-6 px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="cep">{"CEP"} <span className="text-red-500">*</span></Label>
                  <Input id="cep" value={formData.cep} onChange={(e) => { handleInputChange("cep", e.target.value); setCepValid(null) }} onBlur={(e) => fetchAddressByCEP(e.target.value)} maxLength={9} required className={cepValid === false ? "border-red-500 border-2" : cepValid === true ? "border-green-500" : ""} />
                  {cepValid === false && <p className="text-sm text-red-500 font-medium">{"CEP inválido! Verifique o número digitado."}</p>}
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="district">{"Bairro"} <span className="text-red-500">*</span></Label>
                  <Input id="district" value={formData.district} onChange={(e) => handleInputChange("district", e.target.value)} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="city">{"Cidade"} <span className="text-red-500">*</span></Label>
                  <Input id="city" value={formData.city} onChange={(e) => handleInputChange("city", e.target.value)} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="state">{"Estado"} <span className="text-red-500">*</span></Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)} required>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {BRAZILIAN_STATES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2 lg:col-span-3">
                  <Label htmlFor="street">{"Endereço"} <span className="text-red-500">*</span></Label>
                  <Input id="street" value={formData.street} onChange={(e) => handleInputChange("street", e.target.value)} required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="number">{"Número"}</Label>
                  <Input id="number" value={formData.number} onChange={(e) => handleInputChange("number", e.target.value)} />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <Label htmlFor="complement">{"Complemento"}</Label>
                  <Input id="complement" value={formData.complement} onChange={(e) => handleInputChange("complement", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* BLOCO 6 - Forma de Envio */}
        {step === 5 && (
          <Card>
            <CardContent className="pt-6 px-6">
              <RadioGroup value={formData.typeFrete} onValueChange={(value) => handleInputChange("typeFrete", value)} className="flex flex-col gap-3">
                {formData.typeChip === "fisico" && (
                  <>
                    <label htmlFor="frete-carta" className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${formData.typeFrete === "Carta" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <RadioGroupItem value="Carta" id="frete-carta" className="mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">{"Enviar via Carta Registrada"}</span>
                        <p className="text-sm text-gray-500">{"Para quem vai receber o chip pelos Correios"}</p>
                      </div>
                    </label>
                    <label htmlFor="frete-sem" className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${formData.typeFrete === "semFrete" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <RadioGroupItem value="semFrete" id="frete-sem" className="mt-0.5" />
                      <div>
                        <span className="font-medium text-gray-900">{"Retirar na Associação ou com um Associado"}</span>
                        <p className="text-sm text-gray-500">{"Se você vai retirar o chip pessoalmente com um representante ou no caso dos planos da Vivo, vai comprar um chip para ativar de forma imediata"}</p>
                      </div>
                    </label>
                  </>
                )}
                {formData.typeChip === "eSim" && (
                  <label htmlFor="frete-esim" className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${formData.typeFrete === "eSim" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <RadioGroupItem value="eSim" id="frete-esim" />
                    <div>
                      <span className="font-medium text-gray-900">{"Sem a necessidade de envio (e-SIM)"}</span>
                      <p className="text-sm text-gray-500">{"O chip digital será ativado diretamente no seu aparelho"}</p>
                    </div>
                  </label>
                )}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-4">
          {step > 0 ? (
            <Button type="button" variant="outline" onClick={goBack}>{"Voltar"}</Button>
          ) : <div />}
          {step < 5 ? (
            <Button type="button" onClick={goNext} disabled={!canContinue()} className="bg-blue-600 hover:bg-blue-700 text-white">{"Continuar"}</Button>
          ) : (
            <Button type="submit" disabled={loading || !canContinue()} className="bg-green-600 hover:bg-green-700 text-white">
              {loading ? "Processando..." : "Finalizar Cadastro"}
            </Button>
          )}
        </div>
      </form>

      {/* Popup de processamento */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-lg p-6 mx-auto max-w-md w-full shadow-2xl text-center">
            <div className="flex justify-center mb-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
            <h2 className="text-lg font-bold text-red-600 mb-3">{"ATEN\u00C7\u00C3O!"}</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {"N\u00E3o feche essa tela. Estamos processando o seu cadastro. Aguarde a finaliza\u00E7\u00E3o."}
            </p>
          </div>
        </div>
      )}

      <ErrorModal open={showErrorModal} onOpenChange={setShowErrorModal} message={errorMessage} />
    </>
  )
}
