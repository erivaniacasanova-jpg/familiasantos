import RegistrationForm from "@/components/registration-form"

export default async function RepresentantePage({ params }: { params: Promise<{ representanteId: string }> }) {
  const { representanteId } = await params

  const representantes = {
    "134684": {
      id: "134684",
      nome: "William Dos Santos Pessoa",
      whatsapp: "5521969400194",
    },
    "135302": {
      id: "135302",
      nome: "Antonia Erivania Delmiro Jacinto",
      whatsapp: "558498410187",
    },
    "153542": {
      id: "153542",
      nome: "Aline Aparecida Melo",
      whatsapp: "553193371195",
    },
    "88389": {
      id: "88389",
      nome: "Wagner Cruz Vieira",
      whatsapp: "5521996098857",
    },
    "108054": {
      id: "108054",
      nome: " Layanna Kristina Chagas Araujo Faustino",
      whatsapp: "5584986843611",
    },
     "140894": {
      id: "140894",
      nome: "  Francisco Martins Ferreira",
      whatsapp: "5584981317641",
    },
    "167641": {
      id: "167641",
      nome: "  Ricardo De Jesus De Almeida",
      whatsapp: "5517996339074",
    },
    "166779": {
      id: "166779",
      nome: " Antonio Carlos Pinto",
      whatsapp: "5513996206721",
    },
    "166775": {
      id: "166775",
      nome: " Diego Da Silva Felix",
      whatsapp: "553197495796",
    },
     "119294": {
      id: "119294",
      nome: " Narcisio Marques Da Silva",
      whatsapp: "5511974805837",
    },
  }

  const representante = representantes[representanteId as keyof typeof representantes]

  if (!representante) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 md:py-12 px-2 md:px-4">
        <div className="container mx-auto max-w-4xl w-full px-3 sm:px-6 md:px-8">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
            <p className="text-center text-red-600 text-xl">Representante não encontrado.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-6 md:py-12 px-2 md:px-4">
      <div className="container mx-auto max-w-4xl w-full px-3 sm:px-6 md:px-8">
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <p className="text-sm sm:text-base text-gray-700">Preencha o formulário abaixo corretamente para ativarmos o seu plano na Federal Associados. Cadastro rápido, sem consulta ao SPC/SERASA e sem fidelidade.</p>
          </div>
          <RegistrationForm representante={representante} />
        </div>
        <footer className="text-center mt-6 md:mt-8 text-xs sm:text-sm text-gray-600 px-2">
          <p>2026 © Federal Associados (CNPJ 29.383-343-0001/64) - Todos os direitos reservados |</p>
          <p className="mt-1">Patrocinador: {representante.nome}</p>
        </footer>
      </div>
    </main>
  )
}
