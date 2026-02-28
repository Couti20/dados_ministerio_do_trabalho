# -*- coding: utf-8 -*-
"""
Script de Agregação de Dados - Dashboard EPI
Transforma o CSV de 373k registros em JSONs otimizados para o React
Gera dados agregados GERAL e por MACRO-SETOR (Indústria, Logística, Saúde)
"""

import pandas as pd
import json
from pathlib import Path

# Caminhos
CSV_PATH = Path(__file__).parent.parent.parent / "dados_limpos_dashboard_epi.csv"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# ============================================
# DEFINIÇÃO DE MACRO-SETORES (baseado em CNAE)
# ============================================
def classificar_macro_setor(cnae):
    """Classifica CNAE em macro-setor para filtro do dashboard"""
    if pd.isna(cnae):
        return 'outros'
    
    cnae_str = str(int(cnae))
    cnae_prefixo = cnae_str[:2] if len(cnae_str) >= 2 else cnae_str
    
    # Indústria & Construção (C + F na CNAE)
    # 10-33: Indústria de Transformação
    # 41-43: Construção
    if cnae_prefixo in ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
                        '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',
                        '30', '31', '32', '33', '41', '42', '43']:
        return 'industria'
    
    # Logística & Transporte (H na CNAE)
    # 49-53: Transporte, Armazenagem e Correio
    if cnae_prefixo in ['49', '50', '51', '52', '53']:
        return 'logistica'
    
    # Saúde (Q na CNAE)
    # 86-88: Saúde humana e serviços sociais
    if cnae_prefixo in ['86', '87', '88']:
        return 'saude'
    
    return 'outros'

MACRO_SETORES = {
    'todos': {'nome': 'Todos os Setores', 'filtro': None},
    'industria': {'nome': 'Indústria & Construção', 'filtro': 'industria'},
    'logistica': {'nome': 'Logística & Transporte', 'filtro': 'logistica'},
    'saude': {'nome': 'Saúde', 'filtro': 'saude'}
}

print("📊 Carregando dados...")
df = pd.read_csv(CSV_PATH, encoding='utf-8')

# Limpar nomes das colunas (remover espaços extras)
df.columns = df.columns.str.strip()

# Renomear colunas para facilitar
df = df.rename(columns={
    'UF Munic. Empregador': 'UF',
    'CNAE2.0 Empregador': 'CNAE',
    'Parte Corpo Atingida': 'ParteCorpo',
    'Natureza da Lesão': 'Lesao',
    'Inferencia_Falta_EPI': 'EPI_Faltando'
})

# Limpar valores
df['UF'] = df['UF'].str.strip()
df['Sexo'] = df['Sexo'].str.strip()
df['ParteCorpo'] = df['ParteCorpo'].str.strip()
df['Lesao'] = df['Lesao'].str.strip()
df['EPI_Faltando'] = df['EPI_Faltando'].str.strip()

# Remover registros com UF zerada ou inválida
df = df[~df['UF'].isin(['Zerado', '', 'nan'])]
df = df.dropna(subset=['UF'])

# Classificar macro-setor baseado no CNAE
print("🏭 Classificando macro-setores...")
df['MacroSetor'] = df['CNAE'].apply(classificar_macro_setor)

# Mostrar distribuição de macro-setores
print("\n📊 Distribuição por Macro-Setor:")
for setor, count in df['MacroSetor'].value_counts().items():
    print(f"   - {setor.capitalize()}: {count:,} ({count/len(df)*100:.1f}%)")

# ============================================
# INFERÊNCIA DE EPI FALTANTE (baseado na parte do corpo)
# ============================================
print("🦺 Aplicando lógica de inferência de EPI...")

def inferir_epi(parte_corpo):
    """Infere o EPI potencialmente faltante baseado na parte do corpo atingida"""
    if pd.isna(parte_corpo):
        return 'Outros / Nao Mapeado'
    
    parte = str(parte_corpo).lower()
    
    # Cabeça -> Capacete
    if any(x in parte for x in ['cabeca', 'cranio', 'face', 'orelha', 'pescoco']):
        return 'Capacete'
    
    # Olhos -> Óculos de Proteção
    if 'olho' in parte:
        return 'Oculos de Protecao'
    
    # Mãos e dedos -> Luvas
    if any(x in parte for x in ['mao', 'dedo', 'punho']):
        return 'Luvas'
    
    # Braços -> Luvas ou Mangote
    if any(x in parte for x in ['braco', 'ombro', 'cotovelo']):
        return 'Luvas'
    
    # Pés -> Calçado de Segurança
    if any(x in parte for x in ['pe ', 'artelh', 'tornozelo']):
        return 'Calcado de Seguranca'
    
    # Pernas -> Calçado ou não mapeado
    if any(x in parte for x in ['perna', 'joelho', 'coxa']):
        return 'Calcado de Seguranca'
    
    # Tórax/Dorso -> Colete ou não mapeado
    if any(x in parte for x in ['torax', 'dorso', 'costa', 'abdomen']):
        return 'Colete/Avental'
    
    return 'Outros / Nao Mapeado'

# Aplicar a inferência
df['EPI_Inferido'] = df['ParteCorpo'].apply(inferir_epi)

print(f"✅ Total de registros válidos: {len(df):,}")

# Mapeamentos globais
meses_nome = {1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
              7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez'}

# Mapeamento de nomes completos para partes do corpo (dados truncados no CSV)
parte_corpo_nome_completo = {
    'Mao (Exceto Punho ou': 'Mão (exceto punho ou dedos)',
    'Mao (Exceto Punho Ou': 'Mão (exceto punho ou dedos)',
    'Pe (Exceto Artelhos)': 'Pé (exceto artelhos)',
    'Olho (Inclusive Nerv': 'Olho (inclusive nervo óptico)',
    'Braco (Entre O Punho': 'Braço (entre punho e cotovelo)',
    'Perna (Entre O Torno': 'Perna (entre tornozelo e joelho)',
    'Articulacao do Torno': 'Articulação do Tornozelo',
    'Perna (Do Tornozelo,': 'Perna (do tornozelo ao joelho)',
    'Cabeca, Nic': 'Cabeça (não classificada)',
    'Partes Multiplas - A': 'Partes Múltiplas - Atingidas',
    'Dorso (Inclusive Mus': 'Dorso (inclusive músculos dorsais)',
    'Torax (Inclusive Org': 'Tórax (inclusive órgãos)',
    'Torax (Inclusive Org,': 'Tórax (inclusive órgãos internos)',
    'Membros Superiores,': 'Membros Superiores (múltiplos)',
    'Membros Superiores, ': 'Membros Superiores (múltiplos)',
    'Antebraco (Entre O P': 'Antebraço (entre punho e cotovelo)',
    'Face, Partes Multipl': 'Face (partes múltiplas)',
    'Face (Inclusive Olho': 'Face (inclusive olhos, nariz, boca)',
    'Face (Inclusive Olho,': 'Face (inclusive olhos, nariz, boca)',
    'Articulacao do Cotov': 'Articulação do Cotovelo',
    'Articulacao do Ombro': 'Articulação do Ombro',
    'Articulacao do Joelh': 'Articulação do Joelho',
    'Articulacao do Punho': 'Articulação do Punho',
    'Coxa (Da Articulacao': 'Coxa (da articulação até o joelho)',
    'Membros Inferiores, ': 'Membros Inferiores (múltiplos)',
    'Membros Inferiores,': 'Membros Inferiores (múltiplos)',
    'Pescoco (Inclusive N': 'Pescoço (inclusive nuca)',
    'Sistemas e Aparelhos': 'Sistemas e Aparelhos (interno)',
    'Abdomen (Inclusive O': 'Abdômen (inclusive órgãos internos)',
    'Quadril (Inclusive A': 'Quadril (inclusive articulação)',
    'Todo o Corpo (Sistem': 'Todo o Corpo (sistêmico)',
    'Areas Internas, Nic': 'Áreas Internas (não classificadas)',
    'Areas Internas - Apa': 'Áreas Internas - Aparelho Digestivo',
    'Areas Internas, Nicp': 'Áreas Internas (não classificadas)',
    'Orgaos Multiplos Int': 'Órgãos Múltiplos Internos',
    'Outras Partes, Nic': 'Outras Partes (não classificadas)',
    'Nao Informado': 'Não Informado',
    # Novos mapeamentos
    'Cabeca, Partes Multi': 'Cabeça (partes múltiplas)',
    'Quadris (Inclusive P': 'Quadris (inclusive pelve)',
    'Braco (Acima do Coto': 'Braço (acima do cotovelo)',
    'Articulacao do Quard': 'Articulação do Quadril',
    'Orgaos Genitais Exte': 'Órgãos Genitais Externos',
    'Orgaos Genitais Inte': 'Órgãos Genitais Internos',
    'Boca (Inclusive Labi': 'Boca (inclusive lábios e dentes)',
    'Orelha (Inclusive Au': 'Orelha (inclusive audição)',
    'Nariz (Inclusive Cav': 'Nariz (inclusive cavidades nasais)',
    'Cranio (Inclusive En': 'Crânio (inclusive encéfalo)',
    'Globo Ocular, Nervo': 'Globo Ocular e Nervo Óptico',
    'Corpo Inteiro, Multi': 'Corpo Inteiro (múltiplas lesões)',
    'Todo o Corpo, Nic': 'Todo o Corpo (não classificado)',
    'Localizacao Nao Info': 'Localização Não Informada',
    'Todo o Corpo, Nicp': 'Todo o Corpo (não classificado)',
    'Sistemas Corporais I': 'Sistemas Corporais Internos',
    'Aparelho Circulatori': 'Aparelho Circulatório',
    'Aparelho Digestivo (': 'Aparelho Digestivo',
    'Aparelho Respiratori': 'Aparelho Respiratório',
    'Sistema Nervoso Cent': 'Sistema Nervoso Central',
    'Sistema Nervoso Peri': 'Sistema Nervoso Periférico',
    # Mapeamentos adicionais
    'Tronco, Nic': 'Tronco (não classificado)',
    'Tronco, Parte Multip': 'Tronco (partes múltiplas)',
    'Localizacao da Lesao': 'Localização da Lesão (não especificada)',
    'Abdome (Inclusive Or': 'Abdômen (inclusive órgãos)',
    'Mandibula (Inclusive': 'Mandíbula (inclusive dentes)',
    'Ouvido (Externo, Med': 'Ouvido (externo, médio e interno)',
    'Sistema Musculo-Esqu': 'Sistema Musculoesquelético',
    'Aparelho Genito-Urin': 'Aparelho Genito-Urinário',
    'Pescoco': 'Pescoço',
    'Artelho': 'Artelhos (dedos do pé)',
}

def normalizar_parte_corpo(parte):
    """Substitui nomes truncados por nomes completos"""
    if parte in parte_corpo_nome_completo:
        return parte_corpo_nome_completo[parte]
    # Tentar match parcial
    for truncado, completo in parte_corpo_nome_completo.items():
        if parte.startswith(truncado[:15]):
            return completo
    return parte

uf_para_sigla = {
    'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
    'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
    'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
    'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
    'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
    'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
    'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO'
}

epi_cores = {
    'Luvas': '#e74c3c',
    'Capacete': '#f39c12', 
    'Oculos de Protecao': '#3498db',
    'Calcado de Seguranca': '#9b59b6',
    'Protetor Auricular': '#1abc9c',
    'Mascara/Respirador': '#34495e',
    'Colete/Avental': '#e67e22',
    'Outros / Nao Mapeado': '#95a5a6'
}

cnae_desc = {
    # Indústria de Alimentos
    1011: 'Abate de Bovinos',
    1012: 'Abate de Suínos/Aves',
    1013: 'Fabricação de Conservas de Carne',
    1020: 'Preservação de Pescados',
    1031: 'Fabricação de Conservas de Frutas',
    1041: 'Fabricação de Óleos Vegetais',
    1051: 'Laticínios',
    1061: 'Beneficiamento de Arroz',
    1062: 'Moagem de Trigo',
    1063: 'Fabricação de Farinha de Mandioca',
    1064: 'Fabricação de Farinha de Milho',
    1065: 'Fabricação de Amidos e Féculas',
    1066: 'Fabricação de Alimentos para Animais',
    1069: 'Moagem e Fabricação de Produtos de Cereais',
    1071: 'Fabricação de Açúcar',
    1072: 'Fabricação de Açúcar Refinado',
    1081: 'Torrefação de Café',
    1082: 'Fabricação de Café Solúvel',
    1091: 'Fabricação de Produtos de Padaria',
    1092: 'Fabricação de Biscoitos',
    1093: 'Fabricação de Massas Alimentícias',
    1094: 'Fabricação de Temperos',
    1095: 'Fabricação de Refeições Prontas',
    1096: 'Fabricação de Bebidas Alcoólicas',
    
    # Bebidas
    1111: 'Fabricação de Aguardentes',
    1112: 'Fabricação de Vinhos',
    1113: 'Fabricação de Cervejas',
    1121: 'Fabricação de Águas Minerais',
    1122: 'Fabricação de Refrigerantes',
    
    # Têxtil e Vestuário
    1311: 'Preparação de Fibras de Algodão',
    1321: 'Tecelagem de Algodão',
    1340: 'Acabamentos em Fios e Tecidos',
    1351: 'Fabricação de Artefatos Têxteis',
    1411: 'Confecção de Roupas Íntimas',
    1412: 'Confecção de Vestuário',
    1413: 'Confecção de Roupas Profissionais',
    1414: 'Fabricação de Acessórios do Vestuário',
    1421: 'Fabricação de Meias',
    1422: 'Fabricação de Artigos do Vestuário de Malha',
    1531: 'Fabricação de Calçados de Couro',
    1532: 'Fabricação de Tênis',
    1533: 'Fabricação de Calçados de Material Sintético',
    
    # Madeira e Papel
    1610: 'Desdobramento de Madeira',
    1621: 'Fabricação de Madeira Laminada',
    1622: 'Fabricação de Madeira Prensada',
    1623: 'Fabricação de Artefatos de Madeira',
    1629: 'Fabricação de Artefatos de Madeira',
    1710: 'Fabricação de Celulose',
    1721: 'Fabricação de Papel',
    1722: 'Fabricação de Cartolina',
    1731: 'Fabricação de Embalagens de Papel',
    1732: 'Fabricação de Embalagens de Papelão',
    1733: 'Fabricação de Papelão Ondulado',
    1741: 'Fabricação de Produtos de Papel',
    1742: 'Fabricação de Fraldas Descartáveis',
    1749: 'Fabricação de Produtos de Pastas',
    
    # Química e Petroquímica
    1910: 'Coquerias',
    1921: 'Fabricação de Produtos do Refino de Petróleo',
    1922: 'Fabricação de Combustíveis',
    1931: 'Fabricação de Álcool',
    1932: 'Fabricação de Biocombustíveis',
    2011: 'Fabricação de Cloro',
    2012: 'Fabricação de Intermediários Químicos',
    2013: 'Fabricação de Adubos',
    2014: 'Fabricação de Gases Industriais',
    2019: 'Fabricação de Outros Químicos Inorgânicos',
    2021: 'Fabricação de Produtos Petroquímicos',
    2022: 'Fabricação de Intermediários Aromáticos',
    2029: 'Fabricação de Produtos Químicos Orgânicos',
    2031: 'Fabricação de Resinas Termoplásticas',
    2032: 'Fabricação de Resinas Termofixas',
    2033: 'Fabricação de Elastômeros',
    2040: 'Fabricação de Fibras Artificiais',
    2051: 'Fabricação de Defensivos Agrícolas',
    2052: 'Fabricação de Desinfetantes',
    2061: 'Fabricação de Sabões e Detergentes',
    2062: 'Fabricação de Produtos de Limpeza',
    2063: 'Fabricação de Cosméticos',
    2071: 'Fabricação de Tintas e Vernizes',
    2072: 'Fabricação de Tintas de Impressão',
    2073: 'Fabricação de Impermeabilizantes',
    2091: 'Fabricação de Adesivos',
    2092: 'Fabricação de Catalisadores',
    2093: 'Fabricação de Aditivos',
    2094: 'Fabricação de Explosivos',
    2099: 'Fabricação de Produtos Químicos',
    
    # Farmacêutica
    2110: 'Fabricação de Medicamentos',
    2121: 'Fabricação de Medicamentos',
    2122: 'Fabricação de Medicamentos Veterinários',
    2123: 'Fabricação de Preparações Farmacêuticas',
    
    # Borracha e Plástico
    2211: 'Fabricação de Pneumáticos',
    2212: 'Reforma de Pneumáticos',
    2219: 'Fabricação de Artefatos de Borracha',
    2221: 'Fabricação de Laminados de Plástico',
    2222: 'Fabricação de Embalagens de Plástico',
    2223: 'Fabricação de Tubos de Plástico',
    2229: 'Fabricação de Artefatos de Plástico',
    
    # Minerais Não Metálicos
    2311: 'Fabricação de Vidro Plano',
    2312: 'Fabricação de Embalagens de Vidro',
    2319: 'Fabricação de Artigos de Vidro',
    2320: 'Fabricação de Cimento',
    2330: 'Fabricação de Artefatos de Concreto',
    2341: 'Fabricação de Produtos Cerâmicos',
    2342: 'Fabricação de Cerâmicas para Revestimento',
    2349: 'Fabricação de Cerâmicas',
    2391: 'Britamento de Pedras',
    2392: 'Fabricação de Cal',
    2399: 'Fabricação de Outros Minerais Não-Metálicos',
    
    # Metalurgia
    2411: 'Produção de Ferro-Gusa',
    2412: 'Produção de Ferroligas',
    2421: 'Produção de Aço',
    2422: 'Produção de Laminados Planos',
    2423: 'Produção de Laminados Longos',
    2424: 'Produção de Relaminados',
    2431: 'Produção de Tubos de Aço',
    2439: 'Produção de Outros Tubos de Ferro e Aço',
    2441: 'Metalurgia de Alumínio',
    2442: 'Metalurgia de Metais Preciosos',
    2443: 'Metalurgia de Cobre',
    2449: 'Metalurgia de Outros Metais Não-Ferrosos',
    2451: 'Fundição de Ferro e Aço',
    2452: 'Fundição de Metais Não-Ferrosos',
    
    # Produtos de Metal
    2511: 'Fabricação de Estruturas Metálicas',
    2512: 'Fabricação de Esquadrias de Metal',
    2513: 'Fabricação de Obras de Caldeiraria',
    2521: 'Fabricação de Tanques Metálicos',
    2522: 'Fabricação de Caldeiras',
    2531: 'Forjaria e Estamparia',
    2532: 'Metalurgia do Pó',
    2539: 'Serviços de Usinagem',
    2541: 'Fabricação de Artigos de Cutelaria',
    2542: 'Fabricação de Ferragens',
    2543: 'Fabricação de Ferramentas',
    2550: 'Fabricação de Artigos de Metal para Uso Doméstico',
    2591: 'Fabricação de Embalagens Metálicas',
    2592: 'Fabricação de Arames',
    2593: 'Fabricação de Molas',
    2599: 'Fabricação de Produtos de Metal',
    
    # Máquinas e Equipamentos
    2811: 'Fabricação de Motores',
    2812: 'Fabricação de Equipamentos Hidráulicos',
    2813: 'Fabricação de Válvulas',
    2814: 'Fabricação de Compressores',
    2815: 'Fabricação de Rolamentos',
    2821: 'Fabricação de Fornos Industriais',
    2822: 'Fabricação de Estufas',
    2823: 'Fabricação de Máquinas de Refrigeração',
    2824: 'Fabricação de Equipamentos de Ar Condicionado',
    2825: 'Fabricação de Ar Condicionado',
    2831: 'Fabricação de Tratores Agrícolas',
    2832: 'Fabricação de Equipamentos para Irrigação',
    2833: 'Fabricação de Máquinas Agrícolas',
    2840: 'Fabricação de Máquinas-Ferramenta',
    2851: 'Fabricação de Máquinas para Metalurgia',
    2852: 'Fabricação de Máquinas para Mineração',
    2853: 'Fabricação de Tratores',
    2854: 'Fabricação de Máquinas para Indústria Têxtil',
    2861: 'Fabricação de Máquinas para Indústria Alimentícia',
    2862: 'Fabricação de Máquinas para Indústria Têxtil',
    2863: 'Fabricação de Máquinas para Indústria do Couro',
    2864: 'Fabricação de Máquinas para Indústrias Diversas',
    2865: 'Fabricação de Máquinas para Indústria de Celulose',
    2866: 'Fabricação de Máquinas para Indústria Gráfica',
    2869: 'Fabricação de Outras Máquinas',
    2891: 'Fabricação de Máquinas para Siderurgia',
    2892: 'Fabricação de Equipamentos de Elevação',
    2893: 'Fabricação de Máquinas para Fabricação de Bebidas',
    2899: 'Fabricação de Outras Máquinas',
    
    # Veículos Automotores
    2910: 'Fabricação de Automóveis',
    2920: 'Fabricação de Caminhões e Ônibus',
    2930: 'Fabricação de Cabines e Carrocerias',
    2941: 'Fabricação de Peças para Veículos',
    2942: 'Fabricação de Carrocerias para Ônibus',
    2943: 'Fabricação de Cabines',
    2944: 'Fabricação de Peças para Sistema de Freio',
    2945: 'Fabricação de Peças para Transmissão',
    2949: 'Fabricação de Peças para Veículos',
    2950: 'Recondicionamento de Motores',
    
    # Outros Equipamentos de Transporte
    3011: 'Construção de Embarcações',
    3012: 'Construção de Embarcações para Esporte',
    3021: 'Fabricação de Locomotivas',
    3022: 'Fabricação de Vagões Ferroviários',
    3031: 'Fabricação de Aeronaves',
    3032: 'Fabricação de Turbinas para Aviação',
    3041: 'Fabricação de Motocicletas',
    3042: 'Fabricação de Bicicletas',
    3050: 'Fabricação de Veículos Militares',
    
    # Móveis
    3101: 'Fabricação de Móveis de Madeira',
    3102: 'Fabricação de Móveis de Metal',
    3103: 'Fabricação de Colchões',
    
    # Produtos Diversos
    3211: 'Lapidação de Gemas',
    3212: 'Fabricação de Bijuterias',
    3220: 'Fabricação de Instrumentos Musicais',
    3230: 'Fabricação de Artigos Esportivos',
    3240: 'Fabricação de Jogos e Brinquedos',
    3250: 'Fabricação de Instrumentos Médicos',
    3291: 'Fabricação de Escovas',
    3292: 'Fabricação de Equipamentos de Segurança',
    3299: 'Fabricação de Produtos Diversos',
    
    # Construção
    4110: 'Incorporação de Empreendimentos',
    4120: 'Construção de Edifícios',
    4211: 'Construção de Rodovias',
    4212: 'Construção de Ferrovias',
    4213: 'Construção de Obras de Arte',
    4221: 'Construção de Redes de Energia',
    4222: 'Construção de Redes de Telecomunicações',
    4223: 'Construção de Redes de Água e Esgoto',
    4291: 'Obras Portuárias',
    4292: 'Montagem de Instalações Industriais',
    4299: 'Construção de Outras Obras',
    4311: 'Demolição e Preparação do Terreno',
    4312: 'Perfuração e Sondagem',
    4313: 'Obras de Terraplenagem',
    4319: 'Outros Serviços de Preparação do Terreno',
    4321: 'Instalações Elétricas',
    4322: 'Instalações Hidráulicas',
    4329: 'Outras Instalações em Construções',
    4330: 'Obras de Acabamento',
    4391: 'Obras de Fundações',
    4399: 'Outras Obras de Construção',
    
    # Comércio
    4511: 'Comércio de Automóveis',
    4512: 'Comércio de Caminhões',
    4520: 'Manutenção de Veículos',
    4530: 'Comércio de Peças para Veículos',
    4541: 'Comércio de Motocicletas',
    4542: 'Comércio de Peças para Motocicletas',
    4543: 'Manutenção de Motocicletas',
    4611: 'Comércio Atacadista de Café',
    4612: 'Comércio Atacadista de Soja',
    4613: 'Comércio Atacadista de Animais',
    4614: 'Comércio Atacadista de Tabaco',
    4615: 'Comércio Atacadista de Algodão',
    4616: 'Comércio Atacadista de Sementes',
    4617: 'Comércio Atacadista de Flores',
    4618: 'Comércio Atacadista de Matérias-Primas',
    4619: 'Comércio Atacadista de Produtos Agrícolas',
    4621: 'Comércio Atacadista de Café Beneficiado',
    4622: 'Comércio Atacadista de Leite',
    4623: 'Comércio Atacadista de Carnes',
    4631: 'Comércio Atacadista de Leite e Laticínios',
    4632: 'Comércio Atacadista de Cereais',
    4633: 'Comércio Atacadista de Hortifrutigranjeiros',
    4634: 'Comércio Atacadista de Carnes e Derivados',
    4635: 'Comércio Atacadista de Bebidas',
    4636: 'Comércio Atacadista de Produtos de Fumo',
    4637: 'Comércio Atacadista de Café Processado',
    4639: 'Comércio Atacadista de Alimentos',
    4641: 'Comércio Atacadista de Tecidos',
    4642: 'Comércio Atacadista de Vestuário',
    4643: 'Comércio Atacadista de Calçados',
    4644: 'Comércio Atacadista de Medicamentos',
    4645: 'Comércio Atacadista de Instrumentos Médicos',
    4646: 'Comércio Atacadista de Cosméticos',
    4647: 'Comércio Atacadista de Artigos de Escritório',
    4649: 'Comércio Atacadista de Artigos de Uso Pessoal',
    4651: 'Comércio Atacadista de Computadores',
    4652: 'Comércio Atacadista de Componentes Eletrônicos',
    4661: 'Comércio Atacadista de Máquinas',
    4662: 'Comércio Atacadista de Equipamentos Médicos',
    4663: 'Comércio Atacadista de Máquinas para Construção',
    4664: 'Comércio Atacadista de Máquinas para Indústria',
    4665: 'Comércio Atacadista de Equipamentos de Transporte',
    4669: 'Comércio Atacadista de Máquinas Diversas',
    4671: 'Comércio Atacadista de Madeira',
    4672: 'Comércio Atacadista de Ferragens',
    4673: 'Comércio Atacadista de Material Elétrico',
    4674: 'Comércio Atacadista de Cimento',
    4679: 'Comércio Atacadista de Materiais de Construção',
    4681: 'Comércio Atacadista de Combustíveis',
    4682: 'Comércio Atacadista de Gás',
    4683: 'Comércio Atacadista de Defensivos Agrícolas',
    4684: 'Comércio Atacadista de Resíduos',
    4685: 'Comércio Atacadista de Produtos Químicos',
    4686: 'Comércio Atacadista de Papel',
    4687: 'Comércio Atacadista de Resíduos e Sucatas',
    4689: 'Comércio Atacadista de Mercadorias',
    4691: 'Comércio Atacadista não Especializado',
    4692: 'Comércio Atacadista de Mercadorias Diversas',
    4693: 'Comércio Atacadista Especializado',
    4711: 'Supermercados e Hipermercados',
    4712: 'Comércio Varejista de Minimercados',
    4713: 'Comércio Varejista de Mercadorias em Geral',
    4721: 'Padarias e Confeitarias',
    4722: 'Açougue',
    4723: 'Peixaria',
    4724: 'Comércio de Doces',
    4729: 'Comércio Varejista de Alimentos',
    4731: 'Postos de Combustível',
    4732: 'Comércio de Lubrificantes',
    4741: 'Comércio de Computadores',
    4742: 'Comércio de Equipamentos de Informática',
    4751: 'Comércio de Equipamentos de Áudio e Vídeo',
    4752: 'Comércio de Ferragens',
    4753: 'Comércio de Tapetes e Cortinas',
    4754: 'Comércio de Material Elétrico',
    4755: 'Comércio de Artigos de Uso Doméstico',
    4756: 'Comércio de Instrumentos Musicais',
    4757: 'Comércio de Peças de Artesanato',
    4759: 'Comércio de Artigos Diversos',
    4761: 'Comércio de Livros',
    4762: 'Comércio de Jornais e Revistas',
    4763: 'Comércio de Artigos de Papelaria',
    4771: 'Comércio Varejista de Vestuário',
    4772: 'Comércio de Calçados',
    4773: 'Comércio de Medicamentos',
    4774: 'Comércio de Artigos Médicos',
    4781: 'Comércio de Diversos em Lojas Especializadas',
    4782: 'Comércio de Artigos Esportivos',
    4783: 'Comércio de Joias e Relógios',
    4784: 'Comércio de Gás',
    4785: 'Comércio de Artigos Usados',
    4789: 'Comércio de Outros Produtos',
    
    # Transporte
    4911: 'Transporte Ferroviário de Carga',
    4912: 'Transporte Metroviário',
    4921: 'Transporte Urbano',
    4922: 'Transporte Rodoviário de Passageiros',
    4923: 'Transporte Rodoviário de Turismo',
    4924: 'Transporte Escolar',
    4929: 'Outros Transportes',
    4930: 'Transporte de Carga',
    4940: 'Transporte Dutoviário',
    4950: 'Trens Turísticos',
    5011: 'Transporte Marítimo de Cabotagem',
    5012: 'Transporte Marítimo de Longo Curso',
    5021: 'Transporte de Navegação Interior',
    5022: 'Transporte de Travessia',
    5030: 'Navegação de Apoio',
    5091: 'Transporte por Navegação de Travessia',
    5099: 'Outros Transportes Aquaviários',
    5111: 'Transporte Aéreo de Passageiros',
    5112: 'Transporte Aéreo de Carga',
    5120: 'Transporte Aéreo de Carga',
    5211: 'Concessionárias de Rodovias',
    5212: 'Carga e Descarga',
    5221: 'Concessionárias de Ferrovias',
    5222: 'Terminais Rodoviários',
    5223: 'Estacionamentos',
    5229: 'Outros Serviços de Transporte',
    5231: 'Gestão de Portos',
    5232: 'Atividades de Agenciamento Marítimo',
    5239: 'Atividades de Apoio ao Transporte Aquaviário',
    5240: 'Gestão de Aeroportos',
    5250: 'Agenciamento de Carga',
    5310: 'Correios',
    5320: 'Serviços de Entrega',
    
    # Alojamento e Alimentação
    5510: 'Hotéis',
    5590: 'Outros Tipos de Alojamento',
    5611: 'Restaurantes e Lanchonetes',
    5612: 'Serviços de Bufê',
    5620: 'Serviços de Catering',
    
    # Telecomunicações e TI
    6010: 'Atividades de Rádio',
    6021: 'Programação de Televisão',
    6022: 'Programação de TV por Assinatura',
    6110: 'Telecomunicações por Fio',
    6120: 'Telecomunicações sem Fio',
    6130: 'Telecomunicações por Satélite',
    6141: 'Operadoras de TV por Assinatura por Cabo',
    6142: 'Operadoras de TV por Assinatura por Satélite',
    6143: 'Operadoras de TV por Assinatura',
    6190: 'Outras Telecomunicações',
    6201: 'Desenvolvimento de Software sob Encomenda',
    6202: 'Desenvolvimento de Software',
    6203: 'Desenvolvimento e Licenciamento de Software',
    6204: 'Consultoria em TI',
    6209: 'Outros Serviços de TI',
    6311: 'Tratamento de Dados',
    6319: 'Portais e Hospedagem',
    
    # Financeiro
    6410: 'Banco Central',
    6421: 'Bancos Comerciais',
    6422: 'Bancos Múltiplos',
    6423: 'Caixas Econômicas',
    6424: 'Crédito Cooperativo',
    6431: 'Bancos de Investimento',
    6432: 'Bancos de Desenvolvimento',
    6433: 'Agências de Fomento',
    6434: 'Sociedades de Crédito',
    6435: 'Sociedades de Crédito',
    6436: 'Sociedades de Crédito',
    6437: 'Sociedades de Crédito',
    6438: 'Instituições de Crédito',
    6440: 'Arrendamento Mercantil',
    6450: 'Sociedades de Capitalização',
    6461: 'Holdings de Instituições Financeiras',
    6462: 'Holdings de Instituições Não Financeiras',
    6463: 'Outras Sociedades de Participação',
    6470: 'Fundos de Investimento',
    6491: 'Sociedades de Fomento Mercantil',
    6492: 'Securitização de Créditos',
    6493: 'Administração de Consórcios',
    6499: 'Outras Atividades Financeiras',
    
    # Seguros
    6511: 'Seguros de Vida',
    6512: 'Seguros Não-Vida',
    6520: 'Seguros de Saúde',
    6530: 'Resseguros',
    6541: 'Previdência Complementar Fechada',
    6542: 'Previdência Complementar Aberta',
    6550: 'Planos de Saúde',
    6611: 'Administração de Bolsas',
    6612: 'Atividades de Intermediação',
    6613: 'Administração de Cartões de Crédito',
    6619: 'Outras Atividades Auxiliares',
    6621: 'Avaliação de Riscos e Perdas',
    6622: 'Corretores de Seguros',
    6629: 'Outras Atividades de Seguros',
    6630: 'Atividades de Administração de Fundos',
    
    # Imobiliário
    6810: 'Compra e Venda de Imóveis',
    6821: 'Incorporação de Imóveis',
    6822: 'Gestão de Imóveis',
    
    # Serviços
    6911: 'Serviços Advocatícios',
    6912: 'Serviços de Cartórios',
    6920: 'Serviços de Contabilidade',
    7020: 'Atividades de Consultoria em Gestão',
    7111: 'Serviços de Arquitetura',
    7112: 'Serviços de Engenharia',
    7119: 'Atividades Técnicas',
    7120: 'Testes e Análises Técnicas',
    7210: 'Pesquisa em Ciências Naturais',
    7220: 'Pesquisa em Ciências Sociais',
    7311: 'Agências de Publicidade',
    7312: 'Agenciamento de Espaços para Publicidade',
    7319: 'Outras Atividades de Publicidade',
    7320: 'Pesquisas de Mercado',
    7410: 'Design e Decoração de Interiores',
    7420: 'Atividades Fotográficas',
    7490: 'Outras Atividades Profissionais',
    7500: 'Atividades Veterinárias',
    
    # Administrativo
    7711: 'Locação de Automóveis',
    7719: 'Locação de Outros Veículos',
    7721: 'Aluguel de Equipamentos Recreativos',
    7722: 'Aluguel de Fitas de Vídeo',
    7723: 'Aluguel de Objetos Pessoais',
    7729: 'Aluguel de Outros Objetos',
    7731: 'Aluguel de Máquinas Agrícolas',
    7732: 'Aluguel de Equipamentos para Construção',
    7733: 'Aluguel de Máquinas de Escritório',
    7739: 'Aluguel de Outras Máquinas',
    7740: 'Gestão de Direitos de Propriedade Intelectual',
    7810: 'Seleção e Agenciamento de Mão de Obra',
    7820: 'Locação de Mão de Obra Temporária',
    7830: 'Fornecimento de Recursos Humanos',
    7911: 'Agências de Viagens',
    7912: 'Operadores Turísticos',
    7990: 'Serviços de Reservas',
    8011: 'Segurança Privada',
    8012: 'Transporte de Valores',
    8020: 'Segurança Eletrônica',
    8030: 'Investigação Particular',
    8111: 'Serviços Combinados de Escritório',
    8112: 'Condomínios Prediais',
    8121: 'Limpeza de Prédios e Domicílios',
    8122: 'Dedetização',
    8129: 'Outras Atividades de Limpeza',
    8130: 'Jardinagem',
    8211: 'Serviços de Apoio Administrativo',
    8219: 'Outros Serviços de Escritório',
    8220: 'Call Centers',
    8230: 'Organização de Eventos',
    8291: 'Cobrança',
    8292: 'Envasamento e Empacotamento',
    8299: 'Outras Atividades de Serviços Prestados',
    
    # Administração Pública
    8411: 'Administração Pública',
    8412: 'Regulação das Atividades Econômicas',
    8413: 'Regulação das Atividades de Saúde',
    8421: 'Relações Exteriores',
    8422: 'Defesa',
    8423: 'Justiça',
    8424: 'Segurança e Ordem Pública',
    8425: 'Defesa Civil',
    8430: 'Seguridade Social',
    
    # Educação
    8511: 'Educação Infantil - Creche',
    8512: 'Educação Infantil - Pré-escola',
    8513: 'Ensino Fundamental',
    8520: 'Ensino Médio',
    8531: 'Educação Superior - Graduação',
    8532: 'Educação Superior - Pós-graduação',
    8533: 'Educação Superior - Extensão',
    8541: 'Educação Profissional de Nível Técnico',
    8542: 'Educação Profissional de Nível Tecnológico',
    8550: 'Atividades de Apoio à Educação',
    8591: 'Ensino de Esportes',
    8592: 'Ensino de Arte e Cultura',
    8593: 'Ensino de Idiomas',
    8599: 'Outras Atividades de Ensino',
    
    # Saúde
    8610: 'Hospitais',
    8621: 'Serviços Móveis de Atendimento a Urgências',
    8622: 'Serviços de Remoção de Pacientes',
    8630: 'Serviços de Atendimento Médico',
    8640: 'Serviços de Atendimento Odontológico',
    8650: 'Atividades de Profissionais da Área de Saúde',
    8660: 'Atividades de Apoio à Gestão de Saúde',
    8690: 'Atividades de Atenção à Saúde',
    8711: 'Asilos',
    8712: 'Residências para Idosos',
    8720: 'Residências para Pessoas com Deficiência',
    8730: 'Atividades de Assistência a Idosos',
    8800: 'Serviços de Assistência Social',
    
    # Cultura e Lazer
    9001: 'Artes Cênicas',
    9002: 'Criação Artística',
    9003: 'Gestão de Espaços Artísticos',
    9101: 'Bibliotecas e Arquivos',
    9102: 'Museus',
    9103: 'Jardins Botânicos',
    9200: 'Exploração de Jogos de Azar',
    9311: 'Gestão de Instalações de Esportes',
    9312: 'Clubes Sociais e Esportivos',
    9313: 'Atividades de Condicionamento Físico',
    9319: 'Outras Atividades Esportivas',
    9321: 'Parques de Diversão',
    9329: 'Outras Atividades de Lazer',
    9411: 'Organizações Empresariais',
    9412: 'Organizações Profissionais',
    9420: 'Sindicatos',
    9430: 'Associações de Defesa de Direitos',
    9491: 'Organizações Religiosas',
    9492: 'Organizações Políticas',
    9493: 'Organizações Associativas Ligadas à Cultura',
    9499: 'Outras Organizações Associativas',
    9511: 'Reparação de Computadores',
    9512: 'Reparação de Equipamentos de Comunicação',
    9521: 'Reparação de Eletrodomésticos',
    9529: 'Reparação de Objetos Pessoais',
    9601: 'Lavanderias',
    9602: 'Cabeleireiros',
    9603: 'Serviços Funerários',
    9609: 'Outras Atividades de Serviços Pessoais',
    
    # Resíduos e Saneamento
    3600: 'Captação e Distribuição de Água',
    3701: 'Gestão de Redes de Esgoto',
    3702: 'Atividades de Tratamento de Esgoto',
    3811: 'Coleta de Resíduos Não-Perigosos',
    3812: 'Coleta de Resíduos Perigosos',
    3821: 'Tratamento e Disposição de Resíduos Não-Perigosos',
    3822: 'Tratamento e Disposição de Resíduos Perigosos',
    3831: 'Recuperação de Materiais Metálicos',
    3832: 'Recuperação de Materiais Plásticos',
    3839: 'Recuperação de Outros Materiais',
    3900: 'Descontaminação e Serviços de Gestão de Resíduos',
    
    # Eletricidade e Gás
    3511: 'Geração de Energia Elétrica',
    3512: 'Transmissão de Energia Elétrica',
    3513: 'Comércio de Energia Elétrica',
    3514: 'Distribuição de Energia Elétrica',
    3520: 'Produção de Gás',
    3530: 'Produção e Distribuição de Vapor',
    
    # Informática e Eletrônicos
    2610: 'Fabricação de Componentes Eletrônicos',
    2621: 'Fabricação de Equipamentos de Informática',
    2622: 'Fabricação de Periféricos',
    2631: 'Fabricação de Equipamentos de Telefonia',
    2632: 'Fabricação de Aparelhos de TV e Áudio',
    2640: 'Fabricação de Aparelhos para Reprodução',
    2651: 'Fabricação de Instrumentos de Medida',
    2652: 'Fabricação de Relógios',
    2660: 'Fabricação de Equipamentos para Diagnóstico',
    2670: 'Fabricação de Equipamentos Ópticos',
    2680: 'Fabricação de Mídias',
    2710: 'Fabricação de Geradores e Transformadores',
    2721: 'Fabricação de Pilhas e Baterias',
    2722: 'Fabricação de Baterias para Veículos',
    2731: 'Fabricação de Fios e Cabos',
    2732: 'Fabricação de Fios e Cabos',
    2733: 'Fabricação de Dispositivos Elétricos',
    2740: 'Fabricação de Lâmpadas',
    2751: 'Fabricação de Eletrodomésticos',
    2759: 'Fabricação de Equipamentos Elétricos',
    2790: 'Fabricação de Outros Equipamentos Elétricos',
    
    # Agricultura e Pecuária
    111: 'Cultivo de Cereais',
    112: 'Cultivo de Algodão',
    113: 'Cultivo de Cana-de-Açúcar',
    114: 'Cultivo de Fumo',
    115: 'Cultivo de Soja',
    116: 'Cultivo de Oleaginosas',
    119: 'Cultivo de Outras Lavouras Temporárias',
    121: 'Horticultura',
    122: 'Cultivo de Flores',
    131: 'Cultivo de Laranja',
    132: 'Cultivo de Uva',
    133: 'Cultivo de Frutas Cítricas',
    134: 'Cultivo de Frutas Diversas',
    135: 'Cultivo de Café',
    139: 'Cultivo de Outras Plantas Permanentes',
    141: 'Produção de Sementes',
    142: 'Produção de Mudas',
    151: 'Criação de Bovinos',
    152: 'Criação de Equinos',
    153: 'Criação de Ovinos e Caprinos',
    154: 'Criação de Suínos',
    155: 'Criação de Aves',
    156: 'Criação de Outros Animais',
    159: 'Pecuária Não Especificada',
    161: 'Atividades de Apoio à Agricultura',
    162: 'Atividades de Apoio à Pecuária',
    163: 'Atividades de Pós-Colheita',
    164: 'Preparação de Terreno',
    170: 'Caça e Serviços Relacionados',
    210: 'Silvicultura',
    220: 'Extração Florestal',
    230: 'Coleta de Produtos Não-Madeireiros',
    240: 'Atividades de Apoio à Silvicultura',
    311: 'Pesca em Água Salgada',
    312: 'Pesca em Água Doce',
    321: 'Aquicultura em Água Salgada',
    322: 'Aquicultura em Água Doce',
    
    # Mineração
    500: 'Extração de Carvão Mineral',
    600: 'Extração de Petróleo e Gás',
    710: 'Extração de Minério de Ferro',
    721: 'Extração de Alumínio',
    722: 'Extração de Minério de Estanho',
    723: 'Extração de Minério de Manganês',
    724: 'Extração de Metais Preciosos',
    725: 'Extração de Minerais Radioativos',
    729: 'Extração de Outros Minerais Metálicos',
    810: 'Extração de Pedra e Areia',
    891: 'Extração de Minerais para Fabricação de Adubos',
    892: 'Extração e Refino de Sal Marinho e Sal-Gema',
    893: 'Extração de Gemas',
    899: 'Extração de Outros Minerais'
}

regiao_corpo = {
    'Dedo': 'mao', 'Mao (Exceto Punho Ou D': 'mao', 'Punho': 'mao',
    'Braco (Entre O Punho,': 'braco', 'Ombro': 'braco', 'Articulacao do Ombro': 'braco',
    'Cabeca': 'cabeca', 'Face (Inclusive Olho,': 'cabeca', 'Olho': 'cabeca',
    'Pescoco': 'cabeca', 'Cranio': 'cabeca',
    'Torax (Inclusive Org,': 'torax', 'Dorso (Inclusive Mus': 'torax', 'Abdomen': 'torax',
    'Perna (Do Tornozelo,': 'perna', 'Joelho': 'perna', 'Coxa': 'perna', 'Articulacao do Torno': 'perna',
    'Pe (Exceto Artelhos)': 'pe', 'Artelhos': 'pe', 'Tornozelo': 'pe',
}

# ============================================
# FUNÇÃO PARA GERAR TODOS OS JSONs DE UM SETOR
# ============================================
def gerar_jsons_setor(df_setor, sufixo=''):
    """Gera todos os arquivos JSON para um DataFrame (filtrado ou completo)"""
    
    n = len(df_setor)
    if n == 0:
        print(f"  ⚠️ Sem dados para gerar{' ('+sufixo+')' if sufixo else ''}")
        return
    
    nome_sufixo = f"_{sufixo}" if sufixo else ""
    
    # 1. MÉTRICAS GERAIS
    metricas = {
        "totalAcidentes": int(n),
        "totalEstados": int(df_setor['UF'].nunique()),
        "idadeMedia": round(df_setor['Idade'].mean(), 1),
        "percentualMasculino": round((df_setor['Sexo'] == 'Masculino').mean() * 100, 1),
        "topEPI": df_setor[df_setor['EPI_Inferido'] != 'Outros / Nao Mapeado']['EPI_Inferido'].mode().iloc[0] if len(df_setor[df_setor['EPI_Inferido'] != 'Outros / Nao Mapeado']) > 0 else "N/A"
    }
    with open(OUTPUT_DIR / f"metricas{nome_sufixo}.json", "w", encoding="utf-8") as f:
        json.dump(metricas, f, ensure_ascii=False, indent=2)
    
    # 2. POR MÊS
    por_mes = df_setor.groupby(['Ano', 'Mes']).size().reset_index(name='total')
    por_mes['periodo'] = por_mes['Ano'].astype(str) + '-' + por_mes['Mes'].astype(str).str.zfill(2)
    por_mes = por_mes.sort_values('periodo')
    dados_mes = por_mes[['periodo', 'Mes', 'total']].to_dict(orient='records')
    for item in dados_mes:
        item['mesNome'] = meses_nome.get(item['Mes'], '')
    with open(OUTPUT_DIR / f"por_mes{nome_sufixo}.json", "w", encoding="utf-8") as f:
        json.dump(dados_mes, f, ensure_ascii=False, indent=2)
    
    # 3. POR UF
    por_uf = df_setor.groupby('UF').size().reset_index(name='total')
    por_uf['sigla'] = por_uf['UF'].map(uf_para_sigla)
    por_uf = por_uf.dropna(subset=['sigla'])
    por_uf = por_uf.sort_values('total', ascending=False)
    dados_uf = por_uf[['UF', 'sigla', 'total']].to_dict(orient='records')
    with open(OUTPUT_DIR / f"por_uf{nome_sufixo}.json", "w", encoding="utf-8") as f:
        json.dump(dados_uf, f, ensure_ascii=False, indent=2)
    
    # 4. POR EPI
    por_epi = df_setor.groupby('EPI_Inferido').size().reset_index(name='total')
    por_epi = por_epi.sort_values('total', ascending=False)
    dados_epi = []
    for _, row in por_epi.iterrows():
        epi = row['EPI_Inferido']
        dados_epi.append({
            'epi': epi,
            'total': int(row['total']),
            'cor': epi_cores.get(epi, '#7f8c8d'),
            'percentual': round(row['total'] / n * 100, 1)
        })
    with open(OUTPUT_DIR / f"por_epi{nome_sufixo}.json", "w", encoding="utf-8") as f:
        json.dump(dados_epi, f, ensure_ascii=False, indent=2)
    
    # 5. POR PARTE DO CORPO
    por_corpo = df_setor.groupby('ParteCorpo').size().reset_index(name='total')
    por_corpo = por_corpo.sort_values('total', ascending=False)
    dados_corpo = []
    for _, row in por_corpo.iterrows():
        parte_original = row['ParteCorpo']
        parte = normalizar_parte_corpo(parte_original)  # Usar nome completo
        regiao = 'outros'
        for key, val in regiao_corpo.items():
            if key.lower() in parte_original.lower():
                regiao = val
                break
        dados_corpo.append({
            'parte': parte,
            'regiao': regiao,
            'total': int(row['total']),
            'percentual': round(row['total'] / n * 100, 1)
        })
    with open(OUTPUT_DIR / f"por_corpo{nome_sufixo}.json", "w", encoding="utf-8") as f:
        json.dump(dados_corpo, f, ensure_ascii=False, indent=2)
    
    # Agregação por região
    por_regiao = {}
    for item in dados_corpo:
        regiao = item['regiao']
        if regiao not in por_regiao:
            por_regiao[regiao] = 0
        por_regiao[regiao] += item['total']
    dados_regiao = [{'regiao': k, 'total': v, 'percentual': round(v/n*100, 1)} 
                    for k, v in sorted(por_regiao.items(), key=lambda x: -x[1])]
    with open(OUTPUT_DIR / f"por_regiao_corpo{nome_sufixo}.json", "w", encoding="utf-8") as f:
        json.dump(dados_regiao, f, ensure_ascii=False, indent=2)
    
    # 6. POR SEXO
    df_sexo = df_setor[df_setor['Sexo'].isin(['Masculino', 'Feminino'])]
    por_sexo = df_sexo.groupby('Sexo').size().reset_index(name='total')
    total_sexo = por_sexo['total'].sum()
    dados_sexo = [{'sexo': row['Sexo'], 'total': int(row['total']), 
                   'percentual': round(row['total']/total_sexo*100, 1)} 
                  for _, row in por_sexo.iterrows()]
    with open(OUTPUT_DIR / f"por_sexo{nome_sufixo}.json", "w", encoding="utf-8") as f:
        json.dump(dados_sexo, f, ensure_ascii=False, indent=2)
    
    # 7. POR FAIXA ETÁRIA
    bins = [0, 18, 25, 35, 45, 55, 65, 100]
    labels = ['< 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    df_setor_copy = df_setor.copy()
    df_setor_copy['faixa_etaria'] = pd.cut(df_setor_copy['Idade'], bins=bins, labels=labels, right=False)
    por_idade = df_setor_copy.groupby('faixa_etaria', observed=True).size().reset_index(name='total')
    dados_idade = [{'faixa': str(row['faixa_etaria']), 'total': int(row['total']),
                    'percentual': round(row['total']/n*100, 1)} 
                   for _, row in por_idade.iterrows()]
    with open(OUTPUT_DIR / f"por_idade{nome_sufixo}.json", "w", encoding="utf-8") as f:
        json.dump(dados_idade, f, ensure_ascii=False, indent=2)
    
    # 8. POR LESÃO
    por_lesao = df_setor.groupby('Lesao').size().reset_index(name='total')
    por_lesao = por_lesao.sort_values('total', ascending=False).head(10)
    dados_lesao = [{'lesao': row['Lesao'], 'total': int(row['total']),
                    'percentual': round(row['total']/n*100, 1)} 
                   for _, row in por_lesao.iterrows()]
    with open(OUTPUT_DIR / f"por_lesao{nome_sufixo}.json", "w", encoding="utf-8") as f:
        json.dump(dados_lesao, f, ensure_ascii=False, indent=2)
    
    # 9. POR CNAE
    por_cnae = df_setor.groupby('CNAE').size().reset_index(name='total')
    por_cnae = por_cnae.sort_values('total', ascending=False).head(15)
    por_cnae['descricao'] = por_cnae['CNAE'].map(cnae_desc).fillna('Outros Setores')
    dados_cnae = [{'cnae': int(row['CNAE']), 'descricao': row['descricao'], 
                   'total': int(row['total']), 'percentual': round(row['total']/n*100, 1)} 
                  for _, row in por_cnae.iterrows()]
    with open(OUTPUT_DIR / f"por_cnae{nome_sufixo}.json", "w", encoding="utf-8") as f:
        json.dump(dados_cnae, f, ensure_ascii=False, indent=2)
    
    # 10. CRUZAMENTO EPI x SETOR
    top_setores = df_setor['CNAE'].value_counts().head(5).index.tolist()
    df_top = df_setor[df_setor['CNAE'].isin(top_setores)]
    cruzamento = df_top.groupby(['CNAE', 'EPI_Inferido']).size().reset_index(name='total')
    dados_cruzamento = []
    for cnae in top_setores:
        setor_data = cruzamento[cruzamento['CNAE'] == cnae]
        dados_cruzamento.append({
            'cnae': int(cnae),
            'descricao': cnae_desc.get(cnae, 'Outros'),
            'epis': setor_data[['EPI_Inferido', 'total']].rename(columns={'EPI_Inferido': 'EPI_Faltando'}).to_dict(orient='records')
        })
    with open(OUTPUT_DIR / f"cruzamento_epi_setor{nome_sufixo}.json", "w", encoding="utf-8") as f:
        json.dump(dados_cruzamento, f, ensure_ascii=False, indent=2)

# ============================================
# GERAR JSONs PARA CADA MACRO-SETOR
# ============================================
print("\n" + "="*50)
print("📁 GERANDO JSONs POR MACRO-SETOR")
print("="*50)

# 1. TODOS (dados gerais - sem sufixo para compatibilidade)
print("\n🌐 Gerando dados GERAIS (todos os setores)...")
gerar_jsons_setor(df, sufixo='')

# 2. INDÚSTRIA & CONSTRUÇÃO
print("\n🏭 Gerando dados INDÚSTRIA & CONSTRUÇÃO...")
df_industria = df[df['MacroSetor'] == 'industria']
gerar_jsons_setor(df_industria, sufixo='industria')

# 3. LOGÍSTICA & TRANSPORTE
print("\n🚚 Gerando dados LOGÍSTICA & TRANSPORTE...")
df_logistica = df[df['MacroSetor'] == 'logistica']
gerar_jsons_setor(df_logistica, sufixo='logistica')

# 4. SAÚDE
print("\n🏥 Gerando dados SAÚDE...")
df_saude = df[df['MacroSetor'] == 'saude']
gerar_jsons_setor(df_saude, sufixo='saude')

# Gerar arquivo de metadados dos setores
metadata = {
    'setores': [
        {'id': 'todos', 'nome': 'Todos os Setores', 'sufixo': '', 'total': int(len(df))},
        {'id': 'industria', 'nome': 'Indústria & Construção', 'sufixo': '_industria', 'total': int(len(df_industria))},
        {'id': 'logistica', 'nome': 'Logística & Transporte', 'sufixo': '_logistica', 'total': int(len(df_logistica))},
        {'id': 'saude', 'nome': 'Saúde', 'sufixo': '_saude', 'total': int(len(df_saude))}
    ]
}
with open(OUTPUT_DIR / "setores_metadata.json", "w", encoding="utf-8") as f:
    json.dump(metadata, f, ensure_ascii=False, indent=2)

print("\n" + "="*50)
print("✅ TODOS OS ARQUIVOS JSON GERADOS COM SUCESSO!")
print("="*50)
print(f"\n📁 Arquivos salvos em: {OUTPUT_DIR}")
print("\nArquivos gerados:")
for f in sorted(OUTPUT_DIR.glob("*.json")):
    print(f"   - {f.name}")
