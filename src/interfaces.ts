export interface InternetAgentRequest{
    prompt: string;
    n_queries?: number; // default three
    service?: InternetService;
    model: Model;
}

export interface Model{
    name: string;
    base_url: string;
    ak: string;
}

export interface InternetService{
    name: 'tavily' | 'jina' | 'brave' | 'exa';
    ak: string;
}

export interface SequentialInternetAgentRequest{
    prompt: string;
    n_queries?: number; // default three
    max_recursion?: number; // default 10
    service?: InternetService;
    model: Model;
}

export interface BrowserAgentRequest{
    prompt: string;
    model: Model;
    maxSteps?: number;
}

export interface BrowserAgentOutput{
    actions: BrowserAgentActions[];
    conclusion: string;
}

export interface BrowserAgentActions{
    action: string;
    screenshot: any; // choose an appropriate format for the screenshot image
}

export interface DocuchatRequest {
    prompt: string;
    document: Buffer; // should contain PDF file data
    model: Model;
}  

export interface PresentationGeneratorRequest {
    prompt: string;
    model: Model;
}

export interface PresentationGeneratorOutput {
    presentation: Buffer;
}

export interface PdfGeneratorRequest {
    prompt: string;
    model: Model;
}

export interface PdfGeneratorOutput {
    pdf: Buffer;
}

export interface ImageGeneratorRequest{
    prompt: string;
    ak: string; // replicate API key
    go_fast?: boolean; // default true
    guidance?: number; // default 3.5
    megapixels?: string; // default "1"
    num_outputs?: number; // default 1
    aspect_ratio?: string; // default "1:1"
    output_format?: string; // default "webp"
    output_quality?: number; // default 80
    prompt_strength?: number; // default 0.8
    num_inference_steps?: number; // default 28
}

export interface ImageGeneratorOutput{
    image: Buffer;
}

export interface VideoGeneratorRequest{
    prompt: string;
    ak: string; // replicate API key
}

export interface VideoGeneratorOutput{
    video: Buffer;
}