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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(SpringExtension.class)
@SpringBootTest
@AutoConfigureMockMvc
public class DataSetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    public void testGetAllDataSets_works() throws Exception {

        mockMvc.perform(get("/api/dataSets", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetDataSetEndpoint_works() throws Exception {

        mockMvc.perform(get("/api/dataSets", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void testCreateDataSetEndpoint_works() throws Exception {

        mockMvc.perform(post("/api/dataSets", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void testCreateDataSetEndpoint_withJSONB_works() throws Exception {

        mockMvc.perform(post("/api/dataSets", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void testUpdateDataSetEndpoint_withJSONB_works() throws Exception {

        mockMvc.perform(put("/api/dataSets", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    public void testDeleteDataSetEndpoint_works() throws Exception {

        mockMvc.perform(delete("/api/dataSets", 1L)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}