/**
 * IUseCase
 *
 * Interface genérica para casos de uso
 * Define o contrato padrão que todos os use cases devem seguir
 */
export interface IUseCase<Input, Output> {
  execute(input: Input): Promise<Output>;
}
