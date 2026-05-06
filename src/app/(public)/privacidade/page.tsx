import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fbf7f2] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/onboarding" 
          className="inline-flex items-center gap-2 text-[#7a7a7a] hover:text-[#2a2a2a] transition-colors mb-12 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para o cadastro
        </Link>

        <h1 className="text-5xl font-serif text-[#2a2a2a] mb-12">Política de Privacidade</h1>
        
        <div className="prose prose-stone max-w-none text-[#5a5a5a] space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-medium text-[#2a2a2a] mb-4">1. Coleta de Dados</h2>
            <p>
              Coletamos apenas informações essenciais para a prestação do serviço fotográfico e gestão de sua galeria, como nome, e-mail e preferências de uso de imagem.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#2a2a2a] mb-4">2. Segurança (LGPD)</h2>
            <p>
              Em conformidade com a LGPD, seus dados são armazenados em ambiente seguro (Supabase/PostgreSQL) com criptografia. Não compartilhamos seus dados com terceiros sem consentimento explícito.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#2a2a2a] mb-4">3. Seus Direitos</h2>
            <p>
              Você tem o direito de solicitar a exclusão de seus dados ou a revogação do consentimento de uso de imagem a qualquer momento através de nossos canais de contato.
            </p>
          </section>

          <p className="text-sm text-[#a1a1a1] pt-12 border-t border-[#f0f0f0]">
            Última atualização: 02 de Maio de 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
