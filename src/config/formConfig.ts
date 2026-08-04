export interface FormConfig {
  actionUrl: string;
  fields: {
    colorType: string; frameType: string; timestamp: string;
    warmCool: string; value: string; chroma: string;
    straight: string; wave: string; natural: string;
  };
}
export const formConfig: FormConfig = {
  actionUrl: '',
  fields: {
    colorType: '', frameType: '', timestamp: '',
    warmCool: '', value: '', chroma: '',
    straight: '', wave: '', natural: '',
  },
};
export const isFormConfigured = (cfg: FormConfig = formConfig): boolean =>
  cfg.actionUrl !== '' && Object.values(cfg.fields).every((v) => v !== '');
