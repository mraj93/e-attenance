export const getRandomWord = async () => {
    try {
        const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const characters = upperCase + lowerCase + numbers;
        let password = '';

        // Ensure the password contains at least one uppercase, one lowercase, and one number
        password += upperCase.charAt(Math.floor(Math.random() * upperCase.length));
        password += lowerCase.charAt(Math.floor(Math.random() * lowerCase.length));
        password += numbers.charAt(Math.floor(Math.random() * numbers.length));

        // Fill the remaining characters randomly
        for (let i = 3; i < 9; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            password += characters.charAt(randomIndex);
        }

        // Shuffle the password to randomize the character order
        password = password.split('').sort(() => Math.random() - 0.5).join('');

        return password;
    } catch (err: any) {
        console.error(`error`, err);
        return undefined;
    }
}
