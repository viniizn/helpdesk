import { prisma } from '../plugins/prisma.js'

async function seed() {
  await prisma.category.createMany({
    data: [
      { name: 'Infraestrutura',  description: 'Servidores, redes, VPN' },
      { name: 'Acesso e Senha',  description: 'Resetar senha, permissões' },
      { name: 'Hardware',        description: 'Equipamentos físicos' },
      { name: 'Software',        description: 'Instalação e licenças' },
    ],
    skipDuplicates: true,
  })

  console.log('Categorias criadas')
  await prisma.$disconnect()
}

seed()