import crashlytics from '@react-native-firebase/crashlytics';


interface AppAttributes {
    appVersion: string;
    buildNumber: string;
    environment: string;
    deviceModel: string;
}


interface UserAttributes {
    userId: string;
    email: string;
    userType: string;
}



class MacroMealsCrashlytics {
    /**
     * Log a message to the crashlytics report
     * @param message `string`
     */
    async log(message: string) {
        crashlytics().log(message);
    }

    /**
     * Set the crashlytics collection enabled
     * @param enabled `boolean`
     */
    async setCrashlyticsCollectionEnabled(enabled: boolean) {
        crashlytics().setCrashlyticsCollectionEnabled(enabled);
    }

    /**
     * Set multiple attributes for the crashlytics report
     * @param attributes Object containing key-value pairs of attributes
     * Example: {
     *   appVersion: '1.0.0',
     *   userId: 'user123',
     *   email: 'user@example.com',
     *   deviceModel: 'iPhone 12',
     *   buildNumber: '123',
     *   environment: 'production'
     * }
    */
    async setAppAttributes(attributes: AppAttributes){
        crashlytics().setAttributes({
            appVersion: attributes.appVersion,
            buildNumber: attributes.buildNumber,
            environment: attributes.environment,
            deviceModel: attributes.deviceModel,
        });
    }

    async setUserAttributes(attributes: UserAttributes){
        crashlytics().setAttributes({
            userId: attributes.userId,
            email: attributes.email,
            userType: attributes.userType,
        });
    }

    /**
     * Clear all user attributes on logout/session end
     */
    async clearUserAttributes(){
        crashlytics().setAttributes({
            userId: '',
            email: '',
            userType: '',
        });
    }

    /**
     * Log an error to the crashlytics report
     * @param error `Error`
     * @param context `string`
     */
    async logError(error: Error, context: string) {
        if (context) {
            crashlytics().log(context);
        }
        crashlytics().recordError(error);
    }

    /**
     * Set a custom key for the crashlytics report
     * @param key `string`
     * @param value `string`
     * 
     */
    async setCustomKey(key: string, value: string) {
        crashlytics().setAttribute(key, value);
    }

    /**
     * This will trigger a crash for testing purposes
     */
    async triggerCrash() {
        console.log('Triggering crash...');
        crashlytics().crash();
    }

    /**
     * Set the user id for the crashlytics report
     * @param userId `string`
     */
    async setUserId(userId: string) {
        crashlytics().setUserId(userId);
    }
    
}

export const macroMealsCrashlytics = new MacroMealsCrashlytics();