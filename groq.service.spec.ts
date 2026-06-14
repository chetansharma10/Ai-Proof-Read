import { GroqService } from "./groq.service";

// The test suite wrapper
describe('GroqService', () => {

    // The Test Assertion
    it('should create an instance', () => {

        // Expecting the mock function to be called once
        expect(new GroqService()).toBeTruthy();
    });
})