// Import actual function handler
import { proofRead } from "./proofread";

// Special function tracks how many times the mock function is called
const mockCreateSpy = jest.fn();

// Intercepting the external sdk
// Tells Jest to intercept any file trying to import the real groq-sdk package and swap it with this fake, custom version instead
jest.mock('groq-sdk', () => {
    return jest.fn().mockImplementation(() => {
        return {
            chat: {
                completions: {
                    create: (...args: any[]) => mockCreateSpy(...args)
                }
            }
        };
    });
});

// The Test Suite Wrapper
describe('Groq Service Simple Test', () => {

    // before every single individual test (it block) in this file.
    beforeEach(() => {

        // Wipes out any previous history on the spy. If another test called it 3 times, this resets the counter back to 0 so tests don't pollute each other
        mockCreateSpy.mockClear();

        // Mocking the return value
        mockCreateSpy.mockResolvedValue({
            choices: [{ message: { content: 'Mocked output' } }]
        });
    });

    // The Test Assertion
    it('should only call the mock function and nothing else', async () => {

        // Calling the actual function
        await proofRead('Test string');

        // Expecting the mock function to be called once
        expect(mockCreateSpy).toHaveBeenCalledTimes(1);
    });


    // The Test Assertion
    it("should return the mocked value", async () => {

        // Calling the actual function
        const result = await proofRead('Test string');

        // Expecting the mock function to be called once
        expect(result.choices[0].message.content).toBe('Mocked output');
    })

});