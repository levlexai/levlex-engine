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