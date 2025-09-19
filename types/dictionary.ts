export interface LoginFormProps {
  dictionary: {
    signIn: {
      title: string;
      description: string;
      username: string;
      password: string;
      button: string;
      buttonLoading: string;
      errors: {
        generic: string;
        tooManyAttempts: string;
        tryLater: string;
      };
      success: {
        title: string;
        description: string;
      };
      validation: {
        username: {
          min: string;
          max: string;
          invalid: string;
        };
        password: {
          min: string;
          max: string;
        };
      };
    };
  };
}

export interface StoryTellingProps {
  dictionary: {
    storytelling: {
      navigation: {
        hero: string;
        about: string;
        services: string;
        caseStudies: string;
      };
      header: {
        brand: string;
      };
      hero: {
        tagline: string;
        highlight: string;
        description: string;
        cta: {
          primary: string;
          secondary: string;
        };
      };
      about: {
        title: string;
        intro: string;
        question: string;
        description: string;
        stats: Array<{
          number: string;
          label: string;
        }>;
      };
      services: {
        title: string;
        offerings: Array<{
          title: string;
          description: string;
          icon: string;
        }>;
        action: string;
      };
      caseStudies: {
        title: string;
        cases: Array<{
          title: string;
          description: string;
          tag: string;
          action: string;
        }>;
      };
      cta: {
        title: string;
        description: string;
        button: string;
        alreadyHaveAccess: string;
      };
      footer: {
        brand: string;
        description: string;
        headings: {
          company: string;
          legal: string;
        };
        company: string[];
        legal: string[];
        copyright: string;
        tagline: string;
        developedBy: string;
      };
    };
  };
}
