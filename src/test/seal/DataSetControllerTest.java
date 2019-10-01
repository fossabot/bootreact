package seal;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
//todo narrow down the context for mvc tests
@SpringBootTest
@AutoConfigureMockMvc
public class DataSetControllerTest extends DataSetTestHelper{

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetAllDataSets_works() throws Exception {

        mockMvc.perform(get("/api/dataSets", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.dataSets").exists());
    }

    @Test
    public void testGetDataSetEndpoint_works() throws Exception {

        String validName = "Frodo Baggins";
        String validAge = "33";
        String validDiagnosis = "Testicle Cancer";

        mockMvc.perform(get("/api/dataSets/{id}", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(validName))
                .andExpect(jsonPath("$.age").value(validAge))
                .andExpect(jsonPath("$.diagnosis").value(validDiagnosis));
    }

    @Test
    public void testCreateDataSetEndpoint_works() throws Exception {

        DataSet validDataSet = new DataSet("Peregrin Tester", 35, "Testicle Cancer");

        mockMvc.perform(post("/api/dataSets")
                .content(asJsonString(validDataSet))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(validDataSet.getName()))
                .andExpect(jsonPath("$.age").value(validDataSet.getAge()))
                .andExpect(jsonPath("$.diagnosis").value(validDataSet.getDiagnosis()));
    }

    @Test
    public void testUpdateDataSetEndpoint_works() throws Exception {

        DataSet validDataSet = new DataSet("Frodo Baggins", 33, "Lungs Cancer");
        validDataSet.setId(1L);

        mockMvc.perform(put("/api/dataSets/{id}", 1)
                .content(asJsonString(validDataSet))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(validDataSet.getName()))
                .andExpect(jsonPath("$.age").value(validDataSet.getAge()))
                .andExpect(jsonPath("$.diagnosis").value(validDataSet.getDiagnosis()));
    }

    @Test
    public void testCreateDataSetEndpoint_withJSONB_works() throws Exception {

        DataSet validDataSet = new DataSet("Peregrin Tester", 32, "Testicle Cancer",
                "{" +
                        "   \"sex\": \"male\"," +
                        "   \"kids\": \"6\"" +
                        "}");

        mockMvc.perform(post("/api/dataSets")
                .content(asJsonString(validDataSet))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(validDataSet.getName()))
                .andExpect(jsonPath("$.age").value(validDataSet.getAge()))
                .andExpect(jsonPath("$.diagnosis").value(validDataSet.getDiagnosis()))
                .andExpect(jsonPath("$.properties").value(validDataSet.getProperties()));
    }

    @Test
    public void testUpdateDataSetEndpoint_withJSONB_works() throws Exception {

        DataSet validDataSet = new DataSet("Peregrin Tester", 35, "Brain Cancer");
        validDataSet.setId(1L);

        mockMvc.perform(put("/api/dataSets/{id}", 1)
                .content(asJsonString(validDataSet))
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value(validDataSet.getName()))
                .andExpect(jsonPath("$.age").value(validDataSet.getAge()))
                .andExpect(jsonPath("$.diagnosis").value(validDataSet.getDiagnosis()));
    }

    @Test
    public void testDeleteDataSetEndpoint_works() throws Exception {

        mockMvc.perform(delete("/api/dataSets/{id}", 4L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());
    }
}