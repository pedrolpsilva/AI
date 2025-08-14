import { Body, Controller, Post } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { testeDto } from './dto/teste.dto';
import { gemini20Flash, googleAI } from '@genkit-ai/googleai';
import { genkit, z, ToolRequest } from 'genkit';
import { GOOGLE_KEY } from 'src/helper/AIKey';
import { test } from './prompts/system/resume';
import { historyPersonalityDto } from './dto/historyPersonality.dto';
import { TruckService } from 'src/truck/truck.service';

const ai = genkit({
  plugins: [googleAI({apiKey: GOOGLE_KEY})],
  model: gemini20Flash,
  name: 'TotalTracApp API',
}) 

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService, private readonly truckService: TruckService) {}

  @Post('generate-text') 
  async generateText(@Body() req: testeDto) { 
    const first = ai.defineFlow('Resumo', async (reqs) => {
      const newJSON = JSON.stringify(reqs.infos)

      const { text } = await ai.generate({
        system: test,
        prompt:`Nome:${req.name}. ${req.command}. ${newJSON}`
      });
      const res = await JSON.parse(text.replace(/^```json\n/, '').replace(/\n```$/, ''))
      return res
    });
    
    return await first(req)
  }

 
  @Post('history_personality')
  async historyPersonality(@Body() req: historyPersonalityDto) {
    const userPrompt = `O usuário ${req.name} pediu a seguinte informação: '${req.command}', referente ao veículo de placa '${req.place}'.`;
    console.log(`[PROMPT GERADO] ${userPrompt}`);
    
    const buscarVeiculoTool = ai.defineTool(
      {
        name: 'buscarDadosVeiculoPorPlaca',
        description: 'Use esta ferramenta para buscar os dados de cadastro de um veículo específico no banco de dados, usando a placa do veículo.',
        inputSchema: z.object({
          placa: z.string().describe('A placa do veículo a ser pesquisado.'),
        }),
        outputSchema: z.any(),
      },
      async (input) => {
        console.log(`[TOOL] Executando busca para a placa: ${input.placa}`);
        const result = await this.truckService.cadastroVeiculo(input.placa);
        return result || { error: 'Nenhum dado encontrado para esta placa.' };
      },
    );
    
    const response = await ai.generate({
      prompt: userPrompt,
      tools: [buscarVeiculoTool],
    });

    // 1. CORREÇÃO: Chame o método .toolRequests() para obter o array.
    const toolRequests = response.toolRequests;

      
    const toolRequest = toolRequests[0];
    console.log('[AI] Solicitou a ferramenta:', toolRequest.name);

    // 3. Execute a ferramenta e obtenha o resultado.
    const toolOutput = await this.truckService.cadastroVeiculo(toolRequest.input.placa);

    // 4. (Opcional, mas recomendado) Envie o resultado de volta para a IA.
    const finalResponse = await ai.generate({
      prompt: userPrompt,
      history: [
        response.message, // A mensagem da IA que solicitou a ferramenta.
        generateToolResponse({ // A resposta da sua ferramenta.
          toolRequest,
          result: toolOutput,
        }),
      ],
    });
    
    return { answer: finalResponse.text() };
  }
}