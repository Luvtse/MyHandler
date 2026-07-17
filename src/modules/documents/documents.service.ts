import prisma from '../../utils/prisma';

export const documentsService = {
  async findByShipment(shipmentId: string) {
    return prisma.document.findMany({
      where: { shipmentId }
    });
  },
  
  async findByUser(userId: string) {
    return prisma.document.findMany({
      where: { userId }
    });
  },
  
  async create(data: any) {
    return prisma.document.create({
      data: {
        name: data.name,
        type: data.type,
        size: data.size,
        url: data.url,
        userId: data.userId,
        shipmentId: data.shipmentId
      }
    });
  },
  
  async delete(id: string) {
    return prisma.document.delete({
      where: { id }
    });
  },
  
  async findById(id: string) {
    return prisma.document.findUnique({
      where: { id }
    });
  }
};