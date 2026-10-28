export default defineEventHandler(event=>({authenticated:adminAuthenticated(event),local:localAdmin(event),configured:adminConfigured()}))
