"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const tariffs_service_1 = require("./tariffs.service");
const prisma_service_1 = require("../prisma/prisma.service");
describe('TariffsService — Fee Calculations', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                tariffs_service_1.TariffsService,
                {
                    provide: prisma_service_1.PrismaService,
                    useValue: {},
                },
            ],
        }).compile();
        service = module.get(tariffs_service_1.TariffsService);
    });
    it('debe calcular tarifa por fracción de hora redondeada hacia arriba', () => {
        const entry = new Date('2026-09-22T08:00:00Z');
        const exit = new Date('2026-09-22T09:15:00Z');
        const result = service.calculateFee(entry, exit, 2500, 2000, 15000);
        expect(result.duracionMinutos).toBe(75);
        expect(result.horasFacturables).toBe(2);
        expect(result.valorTotal).toBe(5000);
    });
    it('debe aplicar valor mínimo cuando el cálculo por horas sea menor', () => {
        const entry = new Date('2026-09-22T08:00:00Z');
        const exit = new Date('2026-09-22T08:10:00Z');
        const result = service.calculateFee(entry, exit, 2500, 3000, 15000);
        expect(result.duracionMinutos).toBe(10);
        expect(result.horasFacturables).toBe(1);
        expect(result.valorTotal).toBe(3000);
    });
    it('debe topar el valor al valor máximo si se especifica', () => {
        const entry = new Date('2026-09-22T08:00:00Z');
        const exit = new Date('2026-09-22T18:00:00Z');
        const result = service.calculateFee(entry, exit, 2500, 2000, 15000);
        expect(result.horasFacturables).toBe(10);
        expect(result.valorTotal).toBe(15000);
    });
});
//# sourceMappingURL=tariffs.service.spec.js.map