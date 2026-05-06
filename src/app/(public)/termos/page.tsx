import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
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

        <h1 className="text-5xl font-serif text-[#2a2a2a] mb-12">Termos de Uso</h1>
        
        <div className="prose prose-stone max-w-none text-[#5a5a5a] space-y-8 leading-relaxed">
          <section>
            <h2 className="text-xl font-medium text-[#2a2a2a] mb-4">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar o sistema do estúdio Um Mais Um Fotos, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar ou acessar este site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#2a2a2a] mb-4">2. Uso de Galeria</h2>
            <p>
              As galerias fornecidas são para uso pessoal e intransferível do cliente. O estúdio garante a guarda das fotos pelo período estipulado em contrato (mínimo de 6 meses).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-medium text-[#2a2a2a] mb-4">3. Propriedade Intelectual</h2>
            <p>
              Todos os direitos autorais das fotografias pertencem ao estúdio Um Mais Um Fotos, conforme a Lei de Direitos Autorais (Lei nº 9.610/98). O cliente possui o direito de uso das imagens para fins pessoais.
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
