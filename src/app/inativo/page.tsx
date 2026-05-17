import Link from "next/link";
import { Lock, Mail } from "lucide-react";

export default function InativoPage() {
  return (
    <div className="min-h-screen bg-[#fbf7f2] flex flex-col items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-[2.5rem] p-10 text-center shadow-xl shadow-black/5 border border-[#f3eee7]">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={32} />
        </div>
        
        <h1 className="text-3xl font-serif text-[#2a2a2a] mb-4">
          Conta Inativa
        </h1>
        
        <p className="text-[#675d4d] leading-relaxed mb-8">
          O seu acesso à área de clientes está temporariamente suspenso. Por favor, entre em contato com nossa equipe para regularizar a sua situação ou atualizar seus dados.
        </p>

        <a 
          href="https://wa.me/55SEUNUMERO" // TODO: Substituir pelo número real
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#2a2a2a] text-white w-full py-4 rounded-full font-bold tracking-widest text-[10px] uppercase hover:bg-[#1a1a1a] transition-colors flex items-center justify-center gap-2 mb-4"
        >
          <Mail size={16} />
          Falar com o Suporte
        </a>

        <Link href="/" className="text-[10px] text-[#a1a1a1] font-bold tracking-widest uppercase hover:text-[#97816a] transition-colors">
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  );
}
