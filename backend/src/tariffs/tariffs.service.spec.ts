import { Test, TestingModule } from '@nestjs/testing';
import { TariffsService } from './tariffs.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TariffsService — Fee Calculations', () => {
  let service: TariffsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TariffsService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TariffsService>(TariffsService);
  });

  it('debe calcular tarifa por fracción de hora redondeada hacia arriba', () => {
    const entry = new Date('2026-09-22T08:00:00Z');
    const exit = new Date('2026-09-22T09:15:00Z'); // 1 hora y 15 min = 2 horas facturables

    const result = service.calculateFee(entry, exit, 2500, 2000, 15000);

    expect(result.duracionMinutos).toBe(75);
    expect(result.horasFacturables).toBe(2);
    expect(result.valorTotal).toBe(5000); // 2 * 2500
  });

  it('debe aplicar valor mínimo cuando el cálculo por horas sea menor', () => {
    const entry = new Date('2026-09-22T08:00:00Z');
    const exit = new Date('2026-09-22T08:10:00Z'); // 10 min = 1 hora ($2500), pero mínimo es $3000

    const result = service.calculateFee(entry, exit, 2500, 3000, 15000);

    expect(result.duracionMinutos).toBe(10);
    expect(result.horasFacturables).toBe(1);
    expect(result.valorTotal).toBe(3000);
  });

  it('debe topar el valor al valor máximo si se especifica', () => {
    const entry = new Date('2026-09-22T08:00:00Z');
    const exit = new Date('2026-09-22T18:00:00Z'); // 10 horas * $2500 = $25000, tope max $15000

    const result = service.calculateFee(entry, exit, 2500, 2000, 15000);

    expect(result.horasFacturables).toBe(10);
    expect(result.valorTotal).toBe(15000);
  });
});
